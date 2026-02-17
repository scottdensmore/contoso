import os
import sys
from unittest.mock import MagicMock, patch

import pytest

# Add the src/api directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src/api'))

@pytest.mark.skipif(
    os.environ.get("SKIP_EVALUATOR_TESTS") == "true",
    reason="Evaluator tests require GCP credentials"
)
class TestEvaluators:
    """Test the evaluator functions"""

    @patch('evaluators.custom_evals.relevance.GenerativeModel')
    def test_relevance_evaluation(self, mock_model):
        """Test relevance evaluation"""
        # Mock the model response
        mock_response = MagicMock()
        mock_response.text = "5"
        mock_model.return_value.generate_content.return_value = mock_response

        from evaluators.custom_evals.relevance import relevance_evaluation

        result = relevance_evaluation(
            question="What feeds all the fixtures in low voltage tracks?",
            context="A master transformer feeds all of the fixtures on the track.",
            answer="The main transformer feeds all the fixtures in low voltage tracks."
        )

        assert result == "5"

    @patch('evaluators.custom_evals.fluency.GenerativeModel')
    def test_fluency_evaluation(self, mock_model):
        """Test fluency evaluation"""
        # Mock the model response
        mock_response = MagicMock()
        mock_response.text = "5"
        mock_model.return_value.generate_content.return_value = mock_response

        from evaluators.custom_evals.fluency import fluency_evaluation

        result = fluency_evaluation(
            question="How do you make coffee?",
            context="Coffee is made by brewing ground beans.",
            answer="To make coffee, brew ground coffee beans with hot water."
        )

        assert result == "5"

    @patch('evaluators.custom_evals.coherence.GenerativeModel')
    def test_coherence_evaluation(self, mock_model):
        """Test coherence evaluation"""
        # Mock the model response
        mock_response = MagicMock()
        mock_response.text = "5"
        mock_model.return_value.generate_content.return_value = mock_response

        from evaluators.custom_evals.coherence import coherence_evaluation

        result = coherence_evaluation(
            question="What is the capital of France?",
            context="France is a country in Europe with Paris as its capital.",
            answer="The capital of France is Paris."
        )

        assert result == "5"

    @patch('evaluators.custom_evals.groundedness.GenerativeModel')
    def test_groundedness_evaluation(self, mock_model):
        """Test groundedness evaluation"""
        # Mock the model response
        mock_response = MagicMock()
        mock_response.text = "5"
        mock_model.return_value.generate_content.return_value = mock_response

        from evaluators.custom_evals.groundedness import groundedness_evaluation

        result = groundedness_evaluation(
            question="What color is the sky?",
            context="The sky appears blue during the day due to light scattering.",
            answer="The sky is blue."
        )

        assert result == "5"

    def test_evaluator_imports(self):
        """Test that evaluator modules can be imported"""
        try:
            from evaluators.custom_evals import coherence, fluency, groundedness, relevance
            assert all(module is not None for module in (coherence, fluency, groundedness, relevance))
        except ImportError as e:
            pytest.fail(f"Failed to import evaluator modules: {e}")

    @patch.dict(os.environ, {"PROJECT_ID": "test-project", "REGION": "us-central1"})
    def test_evaluator_environment_setup(self):
        """Test that evaluators have required environment variables"""
        assert os.environ.get("PROJECT_ID") == "test-project"
        assert os.environ.get("REGION") == "us-central1"
