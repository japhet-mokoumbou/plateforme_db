from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from .models import Exercise, Submission
from .serializers import ExerciseSerializer, SubmissionSerializer

class ExercisesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Créer un professeur et un étudiant avec des rôles clairs
        self.professor = User.objects.create_user(
            username='prof1', password='test123', is_professor=True, is_student=False
        )
        self.student = User.objects.create_user(
            username='student1', password='test123', is_student=True, is_professor=False
        )
        # Authentifier le professeur
        self.client.force_authenticate(user=self.professor)
        # Créer un exercice
        self.exercise = Exercise.objects.create(
            title='Test Exercise',
            description='Test Description',
            created_by=self.professor,
            expected_sql='SELECT * FROM test_table'
        )

    def test_create_exercise_as_professor(self):
        response = self.client.post(
            '/api/exercises/create/',
            {'title': 'New Exercise', 'description': 'New Desc', 'expected_sql': 'SELECT * FROM users'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Exercise.objects.count(), 2)

    def test_create_exercise_as_student(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            '/api/exercises/create/',
            {'title': 'New Exercise', 'description': 'New Desc'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_submission_as_student(self):
        self.client.force_authenticate(user=self.student)
        data = {
            'exercise': self.exercise.id,
            'content': 'SELECT * FROM test_table'
        }
        response = self.client.post(
            '/api/submissions/create/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, f"Erreur: {response.data}")
        submission = Submission.objects.first()
        self.assertEqual(submission.grade, 10.0)
        self.assertIn('correcte', submission.feedback)

    def test_submission_as_professor(self):
        self.client.force_authenticate(user=self.professor)
        data = {
            'exercise': self.exercise.id,
            'content': 'SELECT * FROM test_table'
        }
        response = self.client.post(
            '/api/submissions/create/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN, f"Erreur: {response.data}")

    def test_student_stats(self):
        self.client.force_authenticate(user=self.student)
        Submission.objects.create(student=self.student, exercise=self.exercise, grade=8.0)
        response = self.client.get('/api/stats/student/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_submissions'], 1)
        self.assertEqual(float(response.data['average_grade']), 8.0)

    def test_professor_stats(self):
        self.client.force_authenticate(user=self.professor)
        Submission.objects.create(student=self.student, exercise=self.exercise, grade=8.0)
        response = self.client.get('/api/stats/professor/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['exercise_title'], 'Test Exercise')