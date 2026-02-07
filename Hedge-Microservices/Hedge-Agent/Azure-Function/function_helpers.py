from Agent.AzurePromptExtraction import AzurePromptExtraction
import logging 
from Agent.AzureAgent import AzureAgent

class function_helpers:

  def __init__(self):
    pass
  

  def get_prompt(self):
    result = AzurePromptExtraction.get_prompt("prompt")
    logging.info(f"Built the prompt")
    return result
  
  
  def query_agent(self) -> str | None:
    logging.info("Querying agent")
    prompt = self.get_prompt()

    agent = AzureAgent("DEFAULT")
    logging.info("Thread Id: %s", agent.thread_id)

    agent.create_message(prompt)

    output = agent.run_agent()
    return output

