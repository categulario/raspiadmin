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
    return jsonify(json.load(open(os.path.join(settings.HOME_DIR, 'settings.json'))))

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
        img_uuid = uuid.uuid1().hex
        img_name = img_uuid+'.jpg'

        try:
            retcode = subprocess.call([
                'raspistill',
                '-t',
                '300',
                '-n',
                '-th',
                '640:480:5',
                '-o',
                settings.CAM_DIR+img_name,
            ])
            retcode = subprocess.call([
                'exiv2',
                '-et',
                settings.CAM_DIR+img_name,
            ])
        except FileNotFoundError:
            raise FailedCommand('Missing command', status_code=500)

        if retcode != 0:
            raise FailedCommand('The command could not be executed', status_code=500)

        return jsonify({
            "src": 'cam/'+img_uuid+'_thumb.jpg'
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

@app.route('/api/gallery', methods=['GET'])
def api_gallery():
    if request.method == 'GET':
        def is_thumb(filename):
            if filename.lower().split('.')[-1] not in ['jpg', 'png', 'gif']:
                return False
            return '_thumb' in filename
        return jsonify({
            'pictures': filter(is_thumb, os.listdir(settings.CAM_DIR))
        })

@app.route('/api/gallery/<path>', methods=['DELETE'])
def api_gallery_delete(path):
    if request.method == 'DELETE':
        full_path = os.path.join(settings.CAM_DIR, path.replace('_thumb', ''))
        thumb_path = os.path.join(settings.CAM_DIR, path)
        if os.path.isfile(full_path):
            os.remove(full_path)
        if os.path.isfile(thumb_path):
            os.remove(thumb_path)
        return ''

if __name__ == "__main__":
    app.run(
        host='0.0.0.0',
        port=4567,
        debug=True,
    )
