from azure.storage.blob import BlobServiceClient
import os
from .AssetStore import AssetStore

class AzurePromptExtraction:
    @staticmethod
    def get_prompt(filename: str) -> str:
        return AssetStore.get_text(f"{filename}.txt")

    @staticmethod
    def set_prompt(filename: str, content: str) -> None:
        AssetStore.put_text(f"{filename}.txt", content)
