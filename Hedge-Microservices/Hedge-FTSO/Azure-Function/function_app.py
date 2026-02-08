import json
import logging
import azure.functions as func

from FTSOConnector import FTSOConnector

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="FTSO_Feed")
def FTSO_feed(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("FTSO_feed HTTP trigger called")

    try:
        ftso = FTSOConnector()

        response_body = ftso.list_prices()

        return func.HttpResponse(
            body=json.dumps(response_body),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.exception("FTSO_feed failed")

        return func.HttpResponse(
            body=json.dumps({
                "error": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )
    
@app.route(route="FTSO_Feed_ETH")
def FTSO_Feed_ETH(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("FTSO_Feed_ETH HTTP trigger called")

    try:
        ftso = FTSOConnector()

        # feedIndex = 2 (based on your Solidity feeds[] order)
        symbol, value, decimals, timestamp = ftso.get_feed_price(2)

        response_body = {
            "symbol": symbol,
            "price": value,
            "decimals": decimals,
            "timestamp": timestamp
        }

        logging.info(f"Result: {response_body}")

        return func.HttpResponse(
            body=json.dumps(response_body),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.exception("FTSO_feed failed")

        return func.HttpResponse(
            body=json.dumps({
                "error": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )
    
@app.route(route="Polymark_Validity", methods=["POST"])
def Polymark_Validity(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Testing polymarkt data")
    
    ftso = FTSOConnector()

    req_body = req.get_json()
    if not req_body:
        return func.HttpResponse(
            "Please pass a JSON body with 'market_list' in the request body.",
            status_code=400
        )
    
    potential_markets = req_body.get('market_list')

    agent_output = req_body.get('agent_output')
    if not potential_markets and not agent_output:
        return func.HttpResponse(
            "Please pass a JSON body with 'market_list' and 'agent_output' in the request body.",
            status_code=400
        )
    
    try:
        successful_slug, boolean_slug, title = ftso.test_markets(potential_markets)

        response_body = {
            "message": agent_output.get('message'),
            "mood": agent_output.get('mood'),
            "confidence": agent_output.get('confidence'),
            "slug_found": boolean_slug,
            "market": {
                "question": title,
                "coin": "ETH",
                "yesPrice": agent_output.get('yesPrice'),
                "successful_slug": successful_slug
            }
        }

        return func.HttpResponse(
            body=json.dumps(response_body),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        return func.HttpResponse(
            f"Error processing request: {str(e)}",
            status_code=500
        )
