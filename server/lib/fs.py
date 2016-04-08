
def touch(filename):
	"""
	Creates the file if it does not exists, but does not implement
	a real linux touch, see:
	http://stackoverflow.com/questions/1158076/implement-touch-using-python#1160227
	"""
	with open(filename, 'w'):
		pass
