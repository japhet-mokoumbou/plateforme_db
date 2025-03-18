from django.shortcuts import render
import PyPDF2  # Nouvelle importation
import requests  # Nouvelle importation
from django.conf import settings  # Nouvelle importation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Exercise, Submission
from .serializers import ExerciseSerializer, SubmissionSerializer
import sqlite3
import sqlparse
from django.db import connections
from django.db.models import Avg, Count


# Fonction pour extraire le texte d’un PDF
def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text() or ''
        return text

# Fonction pour appeler Ollama
def evaluate_with_ollama(content, exercise_description):
    url = 'http://localhost:11434/api/generate'  # URL par défaut d’Ollama
    prompt = f"Évalue cette soumission en fonction de l’énoncé suivant :\nÉnoncé : {exercise_description}\nSoumission : {content}\nDonne une note sur 10 et un commentaire."
    payload = {
        'model': 'deepseek',
        'prompt': prompt,
        'stream': False
    }
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        result = response.json()['response']
        # Supposons que DeepSeek renvoie "Note : X/10 - Commentaire"
        try:
            grade = float(result.split('Note : ')[1].split('/')[0])
            feedback = result.split(' - ')[1] if ' - ' in result else 'Évaluation automatique'
            return grade, feedback
        except:
            return 5.0, 'Erreur dans l’analyse de la réponse IA'
    return 5.0, 'Erreur lors de l’appel à l’IA'

def validate_sql(query):
    """Valide la syntaxe d’une requête SQL."""
    try:
        parsed = sqlparse.parse(query)
        if not parsed:
            return False, "Syntaxe invalide"
        return True, "Syntaxe correcte"
    except Exception as e:
        return False, str(e)

def execute_sql(query):
    """Exécute une requête SQL sur une base de test SQLite."""
    try:
        with sqlite3.connect('test_db.sqlite3') as conn:
            cursor = conn.cursor()
            cursor.execute("CREATE TABLE IF NOT EXISTS test_table (id INTEGER, name TEXT)")
            cursor.execute("INSERT INTO test_table (id, name) VALUES (1, 'Test'), (2, 'Example')")
            cursor.execute(query)
            results = cursor.fetchall()
            return True, results
    except sqlite3.Error as e:
        return False, str(e)

class ExerciseCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_professor:
            return Response({'error': 'Seuls les professeurs peuvent créer des exercices'}, status=403)
        serializer = ExerciseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class ExerciseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        exercises = Exercise.objects.all()
        serializer = ExerciseSerializer(exercises, many=True)
        return Response(serializer.data)

class SubmissionCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_student:
            return Response({'error': 'Seuls les étudiants peuvent soumettre'}, status=403)
        serializer = SubmissionSerializer(data=request.data)
        if serializer.is_valid():
            submission = serializer.save(student=request.user)
            content = submission.content or ""
            if submission.file:
                content = extract_text_from_pdf(submission.file.path)
            
            # Validation SQL si contenu présent
            if content.strip():
                is_valid, sql_feedback = validate_sql(content)
                if is_valid and submission.exercise.expected_sql:
                    # Comparaison avec la réponse attendue
                    expected = submission.exercise.expected_sql.strip()
                    if content.strip().lower() == expected.lower():
                        submission.grade = 10.0
                        submission.feedback = "Requête correcte et identique à la réponse attendue"
                    else:
                        success, results = execute_sql(content)
                        if success:
                            submission.grade = 7.0  # Note partielle si exécutable
                            submission.feedback = f"Requête exécutable mais différente de la réponse attendue : {results}"
                        else:
                            submission.grade = 3.0
                            submission.feedback = f"Requête invalide : {results}"
                
                else:
                    # Évaluation par Ollama si pas de réponse SQL attendue
                    grade, feedback = evaluate_with_ollama(content, submission.exercise.description)
                    submission.grade = grade
                    submission.feedback = feedback if is_valid else f"Syntaxe SQL invalide : {sql_feedback}"
            
            submission.save()
            return Response(SubmissionSerializer(submission).data, status=201)
        return Response(serializer.errors, status=400)
    
class SubmissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_student:
            return Response({'error': 'Seuls les étudiants peuvent voir leurs soumissions'}, status=403)
        submissions = Submission.objects.filter(student=request.user)
        serializer = SubmissionSerializer(submissions, many=True)
        return Response(serializer.data)
    

class ProfessorSubmissionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_professor:
            return Response({'error': 'Seuls les professeurs peuvent voir les soumissions'}, status=403)
        # Récupérer les soumissions pour les exercices créés par ce professeur
        submissions = Submission.objects.filter(exercise__created_by=request.user)
        serializer = SubmissionSerializer(submissions, many=True)
        return Response(serializer.data)

class SubmissionUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, submission_id):
        if not request.user.is_professor:
            return Response({'error': 'Seuls les professeurs peuvent modifier les soumissions'}, status=403)
        try:
            submission = Submission.objects.get(id=submission_id, exercise__created_by=request.user)
        except Submission.DoesNotExist:
            return Response({'error': 'Soumission non trouvée ou non autorisée'}, status=404)
        
        grade = request.data.get('grade', submission.grade)
        feedback = request.data.get('feedback', submission.feedback)
        submission.grade = grade
        submission.feedback = feedback
        submission.save()
        return Response(SubmissionSerializer(submission).data)
    
class StudentStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_student:
            return Response({'error': 'Seuls les étudiants peuvent voir leurs statistiques'}, status=403)
        submissions = Submission.objects.filter(student=request.user)
        stats = {
            'total_submissions': submissions.count(),
            'average_grade': submissions.aggregate(Avg('grade'))['grade__avg'] or 0,
            'completed_exercises': submissions.filter(grade__isnull=False).count(),
        }
        return Response(stats)
    
class ProfessorStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_professor:
            return Response({'error': 'Seuls les professeurs peuvent voir les statistiques'}, status=403)
        exercises = Exercise.objects.filter(created_by=request.user)
        stats = []
        for exercise in exercises:
            submissions = Submission.objects.filter(exercise=exercise)
            stats.append({
                'exercise_title': exercise.title,
                'total_submissions': submissions.count(),
                'average_grade': submissions.aggregate(Avg('grade'))['grade__avg'] or 0,
                'success_rate': submissions.filter(grade__gte=5).count() / max(submissions.count(), 1) * 100,
            })
        return Response(stats)