from django.shortcuts import render
import PyPDF2  # Nouvelle importation
import requests  # Nouvelle importation
from django.conf import settings  # Nouvelle importation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Exercise, Submission
from .serializers import ExerciseSerializer, SubmissionSerializer

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
            # Évaluation automatique
            content = submission.content
            if submission.file:
                content = extract_text_from_pdf(submission.file.path)
            grade, feedback = evaluate_with_ollama(content, submission.exercise.description)
            submission.grade = grade
            submission.feedback = feedback
            submission.save()
            return Response(SubmissionSerializer(submission).data, status=201)
        return Response(serializer.errors, status=400)