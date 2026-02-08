import os
import json
import logging
from openai import AzureOpenAI
from openai import RateLimitError, NotFoundError, OpenAIError

class AzureOpenai:
    @staticmethod
    def _ensure_list(obj) -> list:
        if isinstance(obj, list):
            return [{"slug": x["slug"]} for x in obj if isinstance(x, dict) and isinstance(x.get("slug"), str)]
        if isinstance(obj, str):
            try:
                data = json.loads(obj)
            except Exception:
                return []
            if isinstance(data, list):
                return [{"slug": x["slug"]} for x in data if isinstance(x, dict) and isinstance(x.get("slug"), str)]
        return []

    @staticmethod
    def query_gpt_5(prompt_text: str) -> list:
        client = AzureOpenAI(
            api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
            azure_endpoint=os.getenv("AZURE_ENDPOINT"),
            api_key=os.getenv("SUBSCRIPTION_KEY"),
        )

        try:
            # IMPORTANT: For Azure OpenAI, model should usually be your DEPLOYMENT NAME
            # e.g. model=os.getenv("AZURE_OPENAI_DEPLOYMENT")
            deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-5-chat")

            completion = client.chat.completions.create(
                model=deployment,
                messages=[
                    {
                        "role": "system",
                        "content": "Return ONLY valid JSON. The top-level output must be a JSON array.",
                    },
                    {"role": "user", "content": prompt_text},
                ],
                temperature=0,
            )

            text = completion.choices[0].message.content or "[]"
            return AzureOpenai._ensure_list(text)

        except RateLimitError as e:
            logging.error(f"Rate limit hit: {e}")
            return []
        except (OpenAIError, Exception) as e:
            logging.exception(f"OpenAI call failed: {e}")
            return []
