import json
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pandas as pd
from evaluate import create_response_data, create_summary, evaluate, load_data


def test_load_data_reads_jsonl(tmp_path, monkeypatch):
    data_dir = tmp_path / "evaluators"
    data_dir.mkdir()
    (data_dir / "data.jsonl").write_text('{"customerId":"1","question":"Hello"}\n', encoding="utf-8")
    monkeypatch.chdir(tmp_path)

    df = load_data()

    assert len(df) == 1
    assert str(df.iloc[0]["customerId"]) == "1"
    assert df.iloc[0]["question"] == "Hello"


def test_create_response_data_writes_result_file(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    df = pd.DataFrame([{"customerId": "1", "question": "Best tent?"}])
    mocked_response = {"context": [{"sku": "abc123"}], "answer": "Trailmaster X4"}

    with patch("evaluate.get_response", new=AsyncMock(return_value=mocked_response)) as mock_get_response:
        results = create_response_data(df)

    assert results == [{"question": "Best tent?", "context": [{"sku": "abc123"}], "answer": "Trailmaster X4"}]
    mock_get_response.assert_awaited_once_with(customer_id="1", question="Best tent?", chat_history=[])

    result_lines = (tmp_path / "result.jsonl").read_text(encoding="utf-8").strip().splitlines()
    assert len(result_lines) == 1
    assert json.loads(result_lines[0])["question"] == "Best tent?"


def test_evaluate_adds_scores_and_writes_outputs(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    Path("result.jsonl").write_text(
        '{"question":"Best tent?","context":[{"sku":"abc123"}],"answer":"Trailmaster X4"}\n',
        encoding="utf-8",
    )

    with patch("evaluate.groundedness_evaluation", return_value="4"), patch(
        "evaluate.fluency_evaluation",
        return_value="5",
    ), patch(
        "evaluate.coherence_evaluation",
        return_value="4",
    ), patch(
        "evaluate.relevance_evaluation",
        return_value="5",
    ):
        df = evaluate()

    assert len(df) == 1
    assert str(df.iloc[0]["groundedness"]) == "4"
    assert str(df.iloc[0]["fluency"]) == "5"
    assert str(df.iloc[0]["coherence"]) == "4"
    assert str(df.iloc[0]["relevance"]) == "5"
    assert Path("result_evaluated.jsonl").exists()
    assert Path("eval_results.jsonl").exists()


def test_create_summary_writes_markdown(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    df = pd.DataFrame(
        [
            {
                "question": "Best tent?",
                "context": [{"sku": "abc123"}],
                "answer": "Trailmaster X4",
                "groundedness": 4,
                "fluency": 5,
                "coherence": 4,
                "relevance": 5,
            }
        ]
    )

    create_summary(df)

    content = Path("eval_results.md").read_text(encoding="utf-8")
    assert "Averages scores" in content
