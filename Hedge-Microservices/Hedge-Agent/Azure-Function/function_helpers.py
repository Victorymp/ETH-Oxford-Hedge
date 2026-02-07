from Agent.AzurePromptExtraction import AzurePromptExtraction
import logging 
from Agent.AzureAgent import AzureAgent

class function_helpers:

  def __init__(self):
    pass
  

  def get_prompt(self):
    logging.info("")
    result = AzurePromptExtraction.get_prompt("prompt")
    logging.info(f"Built the prompt")
    return result
  
  def build_prompt(self,prompt:str,ftsodata:str,polymarket_data:str):
    prompt = prompt.replace(f"%FTSO_data%",ftsodata)
    prompt = prompt.replace(f"%polymarket_data%",polymarket_data)
    return prompt
  
  
  def query_agent(self) -> str | None:
    logging.info("Querying agent")
    prompt = self.get_prompt()

    agent = AzureAgent("DEFAULT")
    logging.info("Thread Id: %s", agent.thread_id)

    agent.create_message(prompt)

    output = agent.run_agent()
    return output

