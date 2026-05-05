import os
import logging
from web3 import Web3
from ABIS.FTSOV2_ABI import FTSOV2_ABI
import requests

class FTSOConnector:
    def __init__(self):
      self.RPC_URL = os.getenv("RPC_URL")
      self.CONTRACT_ADDRESS = os.getenv("FTSO_V2_ADDRESS")  # this is your wrapper address

      if not self.RPC_URL or not self.CONTRACT_ADDRESS:
          raise ValueError("RPC_URL and FTSO_V2_ADDRESS must be set")

      self.ABI = FTSOV2_ABI.get_abi()
      self.init_web3_client()

    def init_web3_client(self):
      self.w3 = Web3(Web3.HTTPProvider(self.RPC_URL, request_kwargs={"timeout": 10}))
      if not self.w3.is_connected():
          raise ConnectionError(f"Could not connect to RPC: {self.RPC_URL}")

      self.contract = self.w3.eth.contract(
          address=self.w3.to_checksum_address(self.CONTRACT_ADDRESS),
          abi=self.ABI
      )

    def get_feed_price(self, feed_index: int):
      symbol, price, decimals, timestamp = self.contract.functions.getFeedPrice(feed_index).call()
      value = int(price) / (10 ** int(decimals))
      return symbol, value, int(decimals), int(timestamp)
    
    def list_prices(self) -> list:
      return [ {"id":i, "value":self.get_feed_price(i) } for i in range(3) ]
    
    def polymark_request(self,slug:str):
      logging.info(f"Checking market with slug of: {slug}")
      response = requests.get(f"https://gamma-api.polymarket.com/markets/slug/{slug}")
      if response.status_code != 200:
        logging.info(f"Could not find market")
        return None
      return response.json()
       
    def test_markets(self, markets:list) -> dict:
      successful_slug:str =  "no-slug-found"
      boolean_slug:bool =  False
      title:str = "No Slug Found"

      for mrk in markets:
        response = self.polymark_request(mrk.get("slug"))
        if response != None:
          successful_slug = response.get("slug")
          boolean_slug = True
          title = response.get("question")
          return successful_slug, boolean_slug, title
      return successful_slug, boolean_slug, title
      
      
        
        
            
                
