from flask import Flask, jsonify
from lib.conf import settings
import os

app = Flask(__name__)

@app.route("/api/settings")
def api_settings():
    return jsonify({
        "timelapse_running": os.path.isfile
    })

if __name__ == "__main__":
    app.run(
        host='0.0.0.0',
        port=4567,
        debug=True,
    )
