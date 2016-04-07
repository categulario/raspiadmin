from flask import Flask, jsonify
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/froyo")
def froyo():
	return jsonify(**{
		"msg": "all izz well",
	})

if __name__ == "__main__":
    app.run(
		debug=True,
	)
