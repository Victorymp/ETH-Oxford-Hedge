import os
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import ResourceNotFoundError

class AssetStore:
    CONTAINER_NAME = "assets"

    @staticmethod
    def _container_client():
        conn_str = os.environ["AZURE_ASSETS"]  # raises KeyError if missing
        service = BlobServiceClient.from_connection_string(conn_str)
        return service.get_container_client(AssetStore.CONTAINER_NAME)

    @staticmethod
    def put_text(blob_name: str, content: str) -> None:
        container = AssetStore._container_client()
        # Optional: ensure container exists
        try:
            container.get_container_properties()
        except ResourceNotFoundError:
            container.create_container()

        blob = container.get_blob_client(blob_name)
        blob.upload_blob(content.encode("utf-8"), overwrite=True)

    @staticmethod
    def get_text(blob_name: str) -> str:
        container = AssetStore._container_client()
        blob = container.get_blob_client(blob_name)
        data = blob.download_blob().readall()
        return data.decode("utf-8")