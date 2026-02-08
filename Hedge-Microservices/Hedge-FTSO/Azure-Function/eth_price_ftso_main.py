#!/usr/bin/env python3
import os
import time
from datetime import datetime, timezone

from web3 import Web3

# ---------------------------
# REQUIRED CONFIG (env vars)
# ---------------------------
RPC_URL = os.environ.get("RPC_URL")              # e.g. https://your-rpc-host/...
FTSO_V2_ADDRESS = os.environ.get("FTSO_ADDRESS") # e.g. 0xabc...
# ETH/USD feed id (bytes21). Default here is the common "ETH/USD" bytes21 value.
FEED_ID = os.environ.get(
    "FEED_ID",
    "0x014554482f55534400000000000000000000000000"  # "ETH/USD"
)

POLL_SECONDS = float(os.environ.get("POLL_SECONDS", "2.0"))

if not RPC_URL or not FTSO_V2_ADDRESS:
    raise SystemExit(
        "Missing env vars.\n"
        "Set RPC_URL and FTSO_ADDRESS.\n"
        "Optionally set FEED_ID and POLL_SECONDS.\n"
        "\nExample:\n"
        "  RPC_URL='https://...' FTSO_ADDRESS='0x...' python eth_price_ftso.py\n"
    )

# Minimal ABI: only the function we call.
# getFeedById returns (uint256 value, int8 decimals, uint64 timestamp)
FTSOV2_ABI = [
    {
        "name": "getFeedById",
        "type": "function",
        "stateMutability": "payable",
        "inputs": [{"name": "_feedId", "type": "bytes21"}],
        "outputs": [
            {"name": "", "type": "uint256"},
            {"name": "", "type": "int8"},
            {"name": "", "type": "uint64"},
        ],
    }
]

def iso_utc(ts: int) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()

def main() -> int:
    w3 = Web3(Web3.HTTPProvider(RPC_URL, request_kwargs={"timeout": 10}))
    if not w3.is_connected():
        print(f"[error] Could not connect to RPC: {RPC_URL}")
        return 1

    try:
        chain_id = w3.eth.chain_id
    except Exception:
        chain_id = "unknown"

    contract = w3.eth.contract(
        address=w3.to_checksum_address(FTSO_V2_ADDRESS),
        abi=FTSOV2_ABI
    )

    # Ensure FEED_ID is bytes21
    try:
        feed_id_bytes = w3.to_bytes(hexstr=FEED_ID)
    except Exception as e:
        print(f"[error] FEED_ID must be hex, got: {FEED_ID}\n{e}")
        return 1

    if len(feed_id_bytes) != 21:
        print(f"[error] FEED_ID must be 21 bytes (bytes21). Got {len(feed_id_bytes)} bytes.")
        return 1

    print(f"[info] connected chain_id={chain_id}")
    print(f"[info] ftso_v2={contract.address}")
    print(f"[info] feed_id={FEED_ID} (len={len(feed_id_bytes)} bytes)")
    print(f"[info] polling every {POLL_SECONDS:.2f}s\n")

    while True:
        try:
            # Some deployments require a nonzero `value` because function is payable;
            # most accept 0. Keep it at 0 unless your contract requires otherwise.
            raw_value, decimals, ts = contract.functions.getFeedById(feed_id_bytes).call({"value": 0})

            # decimals is int8; raw_value is uint256
            price = raw_value / (10 ** int(decimals))

            print(
                f"{time.strftime('%Y-%m-%d %H:%M:%S')}  "
                f"ETH/USD={price:,.6f}  "
                f"(decimals={int(decimals)}, ts={int(ts)} {iso_utc(int(ts))}, raw={int(raw_value)})"
            )
        except Exception as e:
            print(f"[warn] call failed: {e}")

        time.sleep(POLL_SECONDS)

if __name__ == "__main__":
    raise SystemExit(main())
 