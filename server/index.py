from flask import Flask, jsonify, request
from lib.conf import settings
from lib.fs import touch, file_items, list_items
from lib.errors import FailedCommand
import subprocess
import uuid
import os
import json

app = Flask(__name__)

@app.errorhandler(FailedCommand)
def handle_failed_command(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

@app.route("/api/settings", methods=['GET', 'DELETE'])
def api_settings():
    if request.method == 'GET':
        return jsonify(json.load(open(os.path.join(settings.HOME_DIR, 'settings.json'))))
    elif request.method == 'DELETE':
        # deleting all settings is easy, just erase both files
        json.dump({}, open(os.path.join(settings.HOME_DIR, 'settings.json'), 'w'))
        with open(os.path.join(settings.HOME_DIR, 'settings.txt'), 'w') as settings_plain:
            settings_plain.write('')
        return ''

@app.route("/api/settings/<key>", methods=['PUT'])
def api_settings_set(key):
    if request.method == 'PUT':
        if 'value' not in request.form:
            return '{"msg": "invalid request"}', 400

        setti = json.load(open(os.path.join(settings.HOME_DIR, 'settings.json')))
        value = request.form['value']

        if value == 'true': value = True
        if value == 'false': value = False

        if value:
            setti[key] = value
        elif key in setti:
            del setti[key]

        json.dump(setti, open(os.path.join(settings.HOME_DIR, 'settings.json'), 'w'), indent=2)
        with open(os.path.join(settings.HOME_DIR, 'settings.txt'), 'w') as settings_plain:
            settings_plain.write(' '.join(map(
                file_items,
                setti.items()
            )))

        return jsonify({
            "value": value
        })

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
                '-n',
            ] + reduce(
                lambda x, y: x + y,
                map(
                    list_items,
                    setti.items()
                ),
                []
            ) + [
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
            "src": 'cam/'+img_uuid+'-thumb.jpg'
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
            return '-thumb' in filename
        return jsonify({
            'pictures': filter(is_thumb, os.listdir(settings.CAM_DIR))
        })

@app.route('/api/gallery/<path>', methods=['DELETE'])
def api_gallery_delete(path):
    if request.method == 'DELETE':
        full_path = os.path.join(settings.CAM_DIR, path)
        thumb_path = os.path.join(settings.CAM_DIR, path.split('.')[0]+'-thumb.jpg')
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
