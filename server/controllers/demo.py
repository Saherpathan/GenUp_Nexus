from flask import jsonify

def get_initial_data():
    initial_nodes = [
        {
            "id": "data-input",
            "position": {"x": 0, "y": 0},
            "data": {"label": "Data Input"}
        },
        {
            "id": "data-preprocessing",
            "position": {"x": 200, "y": 0},
            "data": {"label": "Data Preprocessing"}
        },
        {
            "id": "model-training",
            "position": {"x": 400, "y": 0},
            "data": {"label": "Model Training"}
        },
        {
            "id": "model-evaluation",
            "position": {"x": 0, "y": 200},
            "data": {"label": "Model Evaluation"}
        },
        {
            "id": "prediction",
            "position": {"x": 200, "y": 200},
            "data": {"label": "Prediction"}
        },
        {
            "id": "data-visualization",
            "position": {"x": 400, "y": 200},
            "data": {"label": "Data Visualization"}
        },
    ]

    initial_edges = [
        {"id": "data-input-to-preprocessing", "source": "data-input", "target": "data-preprocessing"},
        {"id": "preprocessing-to-training", "source": "data-preprocessing", "target": "model-training"},
        {"id": "training-to-evaluation", "source": "model-training", "target": "model-evaluation"},
        {"id": "training-to-prediction", "source": "model-training", "target": "prediction"},
        {"id": "evaluation-to-visualization", "source": "model-evaluation", "target": "data-visualization"},
        {"id": "prediction-to-visualization", "source": "prediction", "target": "data-visualization"}
    ]

    return jsonify({
        "initialNodes": initial_nodes,
        "initialEdges": initial_edges
    })
