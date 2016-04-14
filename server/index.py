from flask import Flask, jsonify, request
from lib.conf import settings
from lib.fs import touch
from lib.errors import FailedCommand
import subprocess
import uuid
import os

app = Flask(__name__)

@app.errorhandler(FailedCommand)
def handle_failed_command(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

@app.route("/api/settings")
def api_settings():
    return {}

@app.route("/api/timelapse", methods=['GET', 'POST'])
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
    elif request.method == 'GET':
        return jsonify({
            "timelapse_running": os.path.isfile(
                os.path.join(settings.RUN_DIR, 'timelapse.lock')
            )
        })

@app.route('/api/take', methods=['POST'])
def api_take():
    if request.method == 'POST':
        img_name = uuid.uuid1().hex+'.jpg'

        try:
            retcode = subprocess.call([
                'raspistill',
                '-o',
                settings.CAM_DIR+img_name,
            ])
        except FileNotFoundError:
            raise FailedCommand('Missing command', status_code=500)

        if retcode != 0:
            raise FailedCommand('The command could not be executed', status_code=500)

        return jsonify({
            "src": 'cam/'+img_name
        })

@app.route('/api/shutdown', methods=['POST'])
def api_shutdown():
    if request.method == 'POST':
        try:
            retcode = subprocess.call([
                'sudo',
                'halt',
            ])
        except FileNotFoundError:
            raise FailedCommand('Missing command', status_code=500)

        if retcode != 0:
            raise FailedCommand('The command could not be executed', status_code=500)

        return jsonify({
            "msg": 'done'
        })

if __name__ == "__main__":
    app.run(
        host='0.0.0.0',
        port=4567,
        debug=True,
    )
