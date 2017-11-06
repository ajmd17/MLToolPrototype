import sys
import json
import pickle

if len(sys.argv) != 2:
  print "unknown arguments, expected {} <input data>".format(sys.argv[0])
  exit(1)

input_data = json.loads(sys.argv[1])

# @TODO load pickle file from S3
# @TODO evaluate with sklearn using input data provided
# @TODO print result number from 0.0-1.0 to stdout, result should be figured out using the schema in Node.js