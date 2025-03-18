from rest_framework import serializers
from .models import Exercise, Submission
from users.serializers import UserSerializer

class ExerciseSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Exercise
        fields = ['id', 'title', 'description', 'created_by', 'created_at', 'file', 'expected_sql']
        
class SubmissionSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    exercise = ExerciseSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'exercise', 'student', 'submitted_at', 'content', 'file', 'grade']