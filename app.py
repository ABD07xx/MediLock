from flask import Flask, request, send_file
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
import qrcode
import hashlib
import threading
from cryptography.fernet import Fernet
from flask import jsonify
import base64

lock = threading.Lock()

app = Flask(__name__)

CORS(app)
app.secret_key = 'your_secret_key_here'
key = b'gIpxp8Z4GZK_eYyZGHHS6KodQa1FbOhW-a1E7tDkzzo='
cipher_suite = Fernet(key)

def secure_hash(data):
    sha256 = hashlib.sha256()
    sha256.update(data.encode('utf-8'))
    return sha256.hexdigest()

@app.route('/uploadFile', methods=['POST'])
def uploadFile():
    if request.method == 'POST':
        f2 = request.files["File"]
        watermark = request.form['watermark']
        account_id = request.form['account_id']
        
        img = qrcode.make(watermark)
        img.save('QR.jpg')
        
        f2.save("UploadedFile.jpg")
        
        image = Image.open("UploadedFile.jpg")
        width, height = image.size
        size = (450, 80)
        crop_image = Image.open("QR.jpg")
        crop_image.thumbnail(size)
        
        hash_value = secure_hash(account_id)
        hash_value_first_third = hash_value[:len(hash_value)//3]
        hash_value_second_third = hash_value[len(hash_value)//3:2*len(hash_value)//3]
        hash_value_last_third = hash_value[2*len(hash_value)//3:]
        signature_text = f"Hash:\n{hash_value_first_third}\n{hash_value_second_third}\n{hash_value_last_third}"
        
        font_size = 8
        font = ImageFont.truetype("arial.ttf", font_size)
        
        draw = ImageDraw.Draw(image)
        
        text_width, text_height = draw.textsize(signature_text, font=font)
        
        text_x = 10
        text_y = height - text_height - 10
        
        draw.multiline_text((text_x, text_y), signature_text, fill=(0, 0, 0), font=font, spacing=2)
        
        copied_image = image.copy()
        copied_image.paste(crop_image, (width - 85, height - 85))
        
        size = (width, height)
        userImage = copied_image.resize(size)
        userImage.save("src/pinatafile.jpg")

        # Encrypt the file after imposing QR code
        
        with open("src/pinatafile.jpg", 'rb') as file:
            file_data = file.read()
        
        encrypted_data = cipher_suite.encrypt(file_data)
        
        # Save the encrypted file
        with open("src/Encrypted_pinatafile.jpg", 'wb') as file:
            file.write(encrypted_data)

        return "success"
    return "fail"

@app.route('/decryptFile', methods=['POST'])
def decryptFile():
    try:
        print("Request received at /decryptFile")

        # Get the encrypted data from the request
        encrypted_file = request.files['encryptedFile']
        encrypted_data = encrypted_file.read()

        # Save the received encrypted data for comparison (debugging purposes)
        with open("src/Received_For_Comparison_Encrypted_pinatafile.jpg", 'wb') as file:
            file.write(encrypted_data)
        print("Encrypted Data Length: ", len(encrypted_data))

        # Decrypt the data
        try:
            decrypted_data = cipher_suite.decrypt(encrypted_data)
        except Exception as e:
            print(f"Decryption error: {e}")
            return "Decryption failed", 500

        # Save the decrypted data (for debugging)
        with open("src/Decrypted_pinatafile.jpg", 'wb') as file:
            file.write(decrypted_data)

        # Convert the decrypted data to Base64
        base64_encoded = base64.b64encode(decrypted_data).decode('utf-8')
        return jsonify({"image": base64_encoded})


    except Exception as e:
        print(f"An error occurred: {e}")
        return f"Error in Exception Code: {str(e)}", 500


@app.route('/get-cut-image', methods=["GET"])
def get_cut_img():
    image_path = "src/Encrypted_pinatafile.jpg"
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
