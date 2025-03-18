from django.urls import path
from .views import ExerciseCreateView, ExerciseListView, SubmissionCreateView, SubmissionListView, ProfessorSubmissionListView, SubmissionUpdateView

urlpatterns = [
    path('exercises/create/', ExerciseCreateView.as_view(), name='exercise-create'),
    path('exercises/', ExerciseListView.as_view(), name='exercise-list'),
    path('submissions/create/', SubmissionCreateView.as_view(), name='submission-create'),
    path('submissions/', SubmissionListView.as_view(), name='submission-list'),
    path('professor/submissions/', ProfessorSubmissionListView.as_view(), name='professor-submission-list'),
    path('submissions/<int:submission_id>/update/', SubmissionUpdateView.as_view(), name='submission-update'),
]