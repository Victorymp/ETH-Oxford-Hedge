import os

class AzurePromptExtraction:
  
  @staticmethod
  def get_prompt(filename:str):
    base_dir = os.path.dirname(__file__)
    prompt_path = os.path.join(base_dir, "Prompts", f"{filename}.txt")

    with open(prompt_path, "r", encoding="utf-8") as file:
        return file.read()