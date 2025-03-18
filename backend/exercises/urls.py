from django.urls import path
from .views import ExerciseCreateView, ExerciseListView, SubmissionCreateView

urlpatterns = [
    path('exercises/create/', ExerciseCreateView.as_view(), name='exercise-create'),
    path('exercises/', ExerciseListView.as_view(), name='exercise-list'),
    path('submissions/create/', SubmissionCreateView.as_view(), name='submission-create'),
]