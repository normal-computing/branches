from http import HTTPStatus
import json
from concurrent.futures import ThreadPoolExecutor
from human_eval.execution import check_correctness
from flask import Flask, request, jsonify


app = Flask(__name__)

executor = ThreadPoolExecutor(max_workers=5)


@app.route("/execute", methods=["POST"])
def execute():
    data = request.json

    problem = data.get("problem", "")
    completion = data.get("completion", "")
    timeout = data.get("timeout", 5.0)
    args = (problem, completion, timeout)

    if not completion:
        response = jsonify({"error": "No completion provided"})
        response.status_code = HTTPStatus.BAD_REQUEST
        return response

    try:
        future = executor.submit(check_correctness, problem, completion, timeout)
        result = future.result()
        return jsonify({"result": result})
    except Exception as e:
        response = jsonify({"error": str(e)})
        response.status_code = HTTPStatus.INTERNAL_SERVER_ERROR
        return response


@app.errorhandler(500)
def internal_error(error):
    return "500 error: {}".format(str(error)), 500


# executor = ThreadPoolExecutor(max_workers=5)

# class
# def handler(request, response):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)

#             problem = data.get("problem", "")
#             completion = data.get("completion", "")
#             timeout = data.get("timeout", 3.0)
#             args = (problem, completion, timeout)

#             if not completion:
#                 response.statusCode = HTTPStatus.BAD_REQUEST
#                 return json.dumps({"error": "No completion provided"})

#             future = executor.submit(check_correctness, *args)
#             result = future.result()

#             return json.dumps({"result": result})

#         except Exception as e:
#             response.statusCode = HTTPStatus.INTERNAL_SERVER_ERROR
#             return json.dumps({"error": str(e)})

#     else:
#         response.statusCode = HTTPStatus.METHOD_NOT_ALLOWED
#         return json.dumps({"error": "Method not allowed"})
