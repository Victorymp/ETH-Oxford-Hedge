

class FTSOV2_ABI:

  @staticmethod
  def get_abi() -> list:
    FTSOV2_ABI = [
      {
        "type": "function",
        "name": "getFeedPrice",
        "stateMutability": "view",
        "inputs": [
          {
            "name": "feedIndex",
            "type": "uint256"
          }
        ],
        "outputs": [
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "price",
            "type": "uint256"
          },
          {
            "name": "decimals",
            "type": "int8"
          },
          {
            "name": "timestamp",
            "type": "uint64"
          }
        ]
      }
    ]

    return FTSOV2_ABI