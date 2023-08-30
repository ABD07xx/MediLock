from flask import Flask, request, send_file
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
import qrcode
import hashlib
import threading

lock = threading.Lock()

app = Flask(__name__)

CORS(app)
app.secret_key = 'CSE19-05CSE19-28CSE19-62'

def secure_hash(data):
    sha256 = hashlib.sha256()
    sha256.update(data.encode('utf-8'))
    return sha256.hexdigest()

@app.route('/uploadFile', methods=['POST'])
def uploadFile():
    if request.method == 'POST':
        f2 = request.files["File"]
        watermark = request.form['watermark']
        account_id = request.form['account_id']  # Get the account ID from the form
        
        img = qrcode.make(watermark)
        img.save('QR.jpg') 
        
        f2.save("UploadedFile.jpg")  
        
        fileToEmbed = "UploadedFile.jpg"
        
        image = Image.open(fileToEmbed)
        width, height = image.size
        size = (450, 80)
        crop_image = Image.open("QR.jpg")
        crop_image.thumbnail(size)
        
        hash_value = secure_hash(account_id)
        hash_value_first_third = hash_value[:len(hash_value)//3]
        hash_value_second_third = hash_value[len(hash_value)//3:2*len(hash_value)//3]
        hash_value_last_third = hash_value[2*len(hash_value)//3:]
        signature_text = f"Hash:\n{hash_value_first_third}\n{hash_value_second_third}\n{hash_value_last_third}"
        
        font_size = 8  # Adjust this value as needed
        font = ImageFont.truetype("arial.ttf", font_size)
        
        draw = ImageDraw.Draw(image)
        
        text_width, text_height = draw.textsize(signature_text, font=font)
        
        text_x = 10  # Move the text to the left
        text_y = height - text_height - 10  # Align text to the bottom
        
        draw.multiline_text((text_x, text_y), signature_text, fill=(0, 0, 0), font=font, spacing=2)
        
        copied_image = image.copy()
        copied_image.paste(crop_image, (width - 85, height - 85))
        
        size = (width, height)
        userImage = copied_image.resize(size)
        userImage.save("src/pinatafile.jpg") 
        
        return "success" 
    return "fail"

@app.route('/get-cut-image', methods=["GET"])
def get_cut_img():
    image_path = "src/pinatafile.jpg"
    return send_file(image_path, mimetype='image/jpeg')

@app.route('/uploadFile1', methods=['POST'])
def uploadFile1():
    if request.method == 'POST':
        f2 = request.files["File"]
        
        f2.save("a.jpg")  
    
        return "success" 
    return "fail"

if __name__ == "__main__":
    app.run("0.0.0.0")
