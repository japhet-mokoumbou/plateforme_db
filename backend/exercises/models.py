from django.db import models
from users.models import User

class Exercise(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_professor': True})
    created_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='exercises/', null=True, blank=True)
    expected_sql = models.TextField(null=True, blank=True)  # Nouvelle colonne pour la requête attendue

    def __str__(self):
        return self.title

class Submission(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_student': True})
    submitted_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField(null=True, blank=True)
    file = models.FileField(upload_to='submissions/', null=True, blank=True)
    grade = models.FloatField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)  # Nouveau champ

    def __str__(self):
        return f"{self.student.username} - {self.exercise.title}"