from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from azure.ai.agents.models import ListSortOrder
from Agent.AzurePromptExtraction import AzurePromptExtraction
from os import getenv
import logging
import re

class AzureAgent:
    def __init__(self,default_thread:str):
      logging.info("Initialising the agent")
      logging.info("Getting the project")
      self.project : AIProjectClient = AIProjectClient(
      credential=DefaultAzureCredential(),
      endpoint=getenv("AZURE_AGENT_ENDPOINT")) 
      logging.info("Getting the agent")
      self.agent = self.project.agents.get_agent(getenv("AZURE_AGENT_ID"))
      # if default_thread == "DEFAULT":
      #   self.set_default_thread()
      # if default_thread == "LAST":
      #   temp_threadId = AzurePromptExtraction.get_prompt("threadid")
      #   self.set_thread(temp_threadId)
      # else:
      #   ## self.create_thread()
      #   self.set_default_thread()
      self.set_default_thread()
      logging.info(default_thread)

    def create_thread(self):
      thread = self.project.agents.threads.create()
      print(f"Created thread, ID: {thread.id}")
      self.thread_id = thread.id
      logging.info("Saving threadid")
      AzurePromptExtraction.set_prompt("threadid",thread.id)
    
    def set_thread(self,thread_id:str):
       self.thread_id = thread_id
    
    def set_default_thread(self):
      self.thread_id = getenv("AZURE_DEFAULT_THREAD_ID")
    
    def create_message(self,content:str):
      message = self.project.agents.messages.create(
          thread_id=self.thread_id,
          role="user",
          content=content
      )
      return message
    
    def list_messages(self) -> list:
      messages = self.project.agents.messages.list(thread_id=self.thread_id, order=ListSortOrder.ASCENDING)

      for message in messages:
          if message.text_messages:
              print(f"{message.role}: {message.text_messages[-1].text.value}")
      return messages

    def get_message(self,_message_id:str) :
      return self.project.agents.messages.get(thread_id=self.thread_id,message_id=_message_id)
    
    def strip_code_fences(slef,text: str | None) -> str | None:
      if not text:
          return text

      # Remove opening ``` or ```json (or ```anything)
      text = re.sub(r"^```[\w-]*\s*", "", text.strip())

      # Remove closing ```
      text = re.sub(r"\s*```$", "", text)

      return text.strip()
    
    def run_agent(self) -> str | None:
        run = self.project.agents.runs.create_and_process(
            thread_id=self.thread_id,
            agent_id=self.agent.id
        )

        if run.status == "failed":
            logging.error("Run failed: %s", run.last_error)
            return None

        # Get messages and find the last assistant text message
        messages = self.project.agents.messages.list(
            thread_id=self.thread_id,
            order=ListSortOrder.ASCENDING
        )

        last_text = None
        for m in messages:
            if getattr(m, "role", None) == "assistant" and getattr(m, "text_messages", None):
                # take the last chunk of text in that assistant message
                last_text = m.text_messages[-1].text.value
        
        # 🔥 STRIP CODE FENCES HERE
        last_text = self.strip_code_fences(last_text)
        logging.info(f"Respone {last_text}")

        return last_text
