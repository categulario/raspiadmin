from flask import Flask, jsonify, request
from lib.conf import settings
from lib.fs import touch
import subprocess
import uuid
import os

app = Flask(__name__)

@app.route("/api/settings")
def api_settings():
    return jsonify({
        "timelapse_running": os.path.isfile(
            os.path.join(settings.RUN_DIR, 'timelapse.lock')
        )
    })

@app.route("/api/timelapse", methods=['POST'])
def api_timelapse():
    if request.method == 'POST':
        set_running = request.form['set_running'] == 'true'
        if set_running:
            touch(os.path.join(settings.RUN_DIR, 'timelapse.lock'))
        else:
            os.remove(os.path.join(settings.RUN_DIR, 'timelapse.lock'))
        return jsonify({
            "timelapse_running": set_running
        })

@app.route('/api/take', methods=['POST'])
def api_take():
    if request.method == 'POST':
        img_name = uuid.uuid1()+'.jpg'
        retcode = subprocess.call([
            'raspistill',
            '-o',
            settings.CAM_DIR+img_name,
        ])

        return jsonify({
            "src": 'cam/'+img_name
        })

if __name__ == "__main__":
    app.run(
        host='0.0.0.0',
        port=4567,
        debug=True,
    )
