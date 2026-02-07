import azure.functions as func
import logging
from function_helpers import function_helpers
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="hedge_trigger")
def hedge_http_trigger(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    helper = function_helpers()
    result = json.dumps({
        "Result":helper.get_prompt()
        })

    return func.HttpResponse(
        result,
        status_code=200,
        mimetype="application/json"
    )

@app.route(route="hedge_create_message")
def create_messages(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Creating new thread")
    output = function_helpers().query_agent()

    if output is None:
        return func.HttpResponse("Run failed", status_code=500)

    return func.HttpResponse(
        json.dumps({"output": output}),
        mimetype="application/json",
        status_code=200
    )