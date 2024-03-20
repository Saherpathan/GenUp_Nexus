import math
import os
from io import BytesIO
import gradio as gr
import cv2
from PIL import Image
import requests
from transformers import pipeline
from pydub import AudioSegment
from faster_whisper import WhisperModel
import joblib
import mediapipe as mp
import numpy as np
import pandas as pd
import moviepy.editor as mpe
import time

body_lang_model = joblib.load('body_language.pkl')
mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)

theme = gr.themes.Base(
    primary_hue="cyan",
    secondary_hue="blue",
    neutral_hue="slate",
)

model = WhisperModel("small", device="cpu", compute_type="int8")

API_KEY = os.getenv('HF_API_KEY')

pipe1 = pipeline("image-classification", model="dima806/facial_emotions_image_detection")
pipe2 = pipeline("text-classification", model="SamLowe/roberta-base-go_emotions")
# pipe3 = pipeline("audio-classification", model="ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition")

# FACE_API_URL = "https://api-inference.huggingface.co/models/dima806/facial_emotions_image_detection"
# TEXT_API_URL = "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions"
AUDIO_API_URL = "https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
headers = {"Authorization": "Bearer " + API_KEY + ""}


def extract_frames(video_path):
    clip = mpe.VideoFileClip(video_path)
    clip.write_videofile('mp4file.mp4', fps=60)

    cap = cv2.VideoCapture('mp4file.mp4')
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    # try:
    #     while True:
    #         ret, frame = cap.read()
    #         if not ret:
    #             break
    #         total_frames += 1
    # except Exception as e:
    #     print("Done")
    # cap.release()
    # time.sleep(3)
    # cap = cv2.VideoCapture(video_path)
    interval = int(fps/2)
    print(interval, total_frames)

    images = []
    result = []
    distract_count = 0
    total_count = 0
    output_list = []

    for i in range(0, total_frames, interval):
        total_count += 1
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()

        if ret:
            image = cv2.cvtColor(cv2.flip(frame, 1), cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = face_mesh.process(image)
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            img_h, img_w, img_c = image.shape
            face_3d = []
            face_2d = []

            flag = False

            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    for idx, lm in enumerate(face_landmarks.landmark):
                        if idx == 33 or idx == 263 or idx == 1 or idx == 61 or idx == 291 or idx == 199:
                            if idx == 1:
                                nose_2d = (lm.x * img_w, lm.y * img_h)
                                nose_3d = (lm.x * img_w, lm.y * img_h, lm.z * 3000)

                            x, y = int(lm.x * img_w), int(lm.y * img_h)
                            face_2d.append([x, y])
                            face_3d.append([x, y, lm.z])       
                    face_2d = np.array(face_2d, dtype=np.float64)
                    face_3d = np.array(face_3d, dtype=np.float64)
                    focal_length = 1 * img_w
                    cam_matrix = np.array([ [focal_length, 0, img_h / 2],
                                            [0, focal_length, img_w / 2],
                                            [0, 0, 1]])
                    dist_matrix = np.zeros((4, 1), dtype=np.float64)
                    success, rot_vec, trans_vec = cv2.solvePnP(face_3d, face_2d, cam_matrix, dist_matrix)
                    rmat, jac = cv2.Rodrigues(rot_vec)
                    angles, mtxR, mtxQ, Qx, Qy, Qz = cv2.RQDecomp3x3(rmat)
                    x = angles[0] * 360
                    y = angles[1] * 360
                    z = angles[2] * 360

                    if y < -7 or y > 7 or x < -7 or x > 7:
                        flag = True
                    else:
                        flag = False

            if flag == True:
                distract_count += 1

            image2 = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results2 = holistic.process(image2)

            pose = results2.pose_landmarks.landmark
            pose_row = list(np.array([[landmark.x, landmark.y, landmark.z, landmark.visibility] for landmark in pose]).flatten())
            
            face = results2.face_landmarks.landmark
            face_row = list(np.array([[landmark.x, landmark.y, landmark.z, landmark.visibility] for landmark in face]).flatten())

            row = pose_row+face_row

            X = pd.DataFrame([row])
            body_language_class = body_lang_model.predict(X)[0]
            body_language_prob = body_lang_model.predict_proba(X)[0]

            output_dict = {}
            for class_name, prob in zip(body_lang_model.classes_, body_language_prob):
                output_dict[class_name] = prob
            
            output_list.append(output_dict)

            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            response = pipe1(pil_image)

            temp = {}
            for ele in response:
                label, score = ele.values()
                temp[label] = score
            result.append(temp)

        images.append((cv2.cvtColor(frame, cv2.COLOR_BGR2RGB), f"Sentiments: {temp}, Distraction: {1 if flag == True else 0}"))
    
    distraction_rate = distract_count/total_count
    
    total_bad_prob = 0
    total_good_prob = 0

    for output_dict in output_list:
        total_bad_prob += output_dict['Bad']
        total_good_prob += output_dict['Good']

    num_frames = len(output_list)
    avg_bad_prob = total_bad_prob / num_frames
    avg_good_prob = total_good_prob / num_frames

    final_output = {'Bad': avg_bad_prob, 'Good': avg_good_prob}

    print("Frame extraction completed.")

    cap.release()
    return images, result, final_output, distraction_rate


def analyze_sentiment(text):
    response = pipe2(text)
    sentiment_results = {}
    for ele in response:
        label, score = ele.values()
        sentiment_results[label] = score
    # sentiment_list = response.json()[0]
    # sentiment_results = {results['label']: results['score'] for results in sentiment_list}
    return sentiment_results


def video_to_audio(input_video):
    
    frames_images, frames_sentiments, body_language, distraction_rate = extract_frames(input_video)

    cap = cv2.VideoCapture(input_video)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    audio = AudioSegment.from_file(input_video)
    audio_binary = audio.export(format="wav").read()
    audio_bytesio = BytesIO(audio_binary)
    audio_bytesio2 = BytesIO(audio_binary)

    segments, info = model.transcribe(audio_bytesio, beam_size=5)

    response = requests.post(AUDIO_API_URL, headers=headers, data=audio_bytesio2)
    # response = pipe3(audio_bytesio)
    # audio_list = list(response.json())
    # formatted_response = {results['label'] : results['score'] for results in audio_list}
    print(response.json())
    formatted_response = {}
    for ele in response.json():
        score, label = ele.values()
        formatted_response[label] = score

    # print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

    transcript = ''
    audio_divide_sentiment = ''
    video_sentiment_markdown = ''
    video_sentiment_final = []
    final_output = []

    for segment in segments:
        transcript = transcript + segment.text + " "
        transcript_segment_sentiment = analyze_sentiment(segment.text)
        audio_divide_sentiment += "[%.2fs -> %.2fs] %s :  %s`\`" % (segment.start, segment.end, segment.text, transcript_segment_sentiment)

        emotion_totals = {
            'admiration': 0.0,
            'amusement': 0.0,
            'angry': 0.0,
            'annoyance': 0.0,
            'approval': 0.0,
            'caring': 0.0,
            'confusion': 0.0,
            'curiosity': 0.0,
            'desire': 0.0,
            'disappointment': 0.0,
            'disapproval': 0.0,
            'disgust': 0.0,
            'embarrassment': 0.0,
            'excitement': 0.0,
            'fear': 0.0,
            'gratitude': 0.0,
            'grief': 0.0,
            'happy': 0.0,
            'love': 0.0,
            'nervousness': 0.0,
            'optimism': 0.0,
            'pride': 0.0,
            'realization': 0.0,
            'relief': 0.0,
            'remorse': 0.0,
            'sad': 0.0,
            'surprise': 0.0,
            'neutral': 0.0
        }

        counter = 0
        for i in range(math.ceil(segment.start), math.floor(segment.end)):
            for emotion in frames_sentiments[i].keys():
                emotion_totals[emotion] += frames_sentiments[i].get(emotion)
            counter += 1

        for emotion in emotion_totals:
            emotion_totals[emotion] /= counter

        video_sentiment_final.append(emotion_totals)

        video_segment_sentiment = {key: value for key, value in emotion_totals.items() if value != 0.0}

        video_sentiment_markdown += f"Frame {fps*math.ceil(segment.start)} - Frame {fps*math.floor(segment.end)} : {video_segment_sentiment}`\`"

        segment_finals = {segment.id: (segment.text, segment.start, segment.end, transcript_segment_sentiment, video_segment_sentiment)}
        final_output.append(segment_finals)

    total_transcript_sentiment = {key: value for key, value in analyze_sentiment(transcript).items() if value >= 0.01}

    emotion_finals = {
        'admiration': 0.0,
        'amusement': 0.0,
        'angry': 0.0,
        'annoyance': 0.0,
        'approval': 0.0,
        'caring': 0.0,
        'confusion': 0.0,
        'curiosity': 0.0,
        'desire': 0.0,
        'disappointment': 0.0,
        'disapproval': 0.0,
        'disgust': 0.0,
        'embarrassment': 0.0,
        'excitement': 0.0,
        'fear': 0.0,
        'gratitude': 0.0,
        'grief': 0.0,
        'happy': 0.0,
        'love': 0.0,
        'nervousness': 0.0,
        'optimism': 0.0,
        'pride': 0.0,
        'realization': 0.0,
        'relief': 0.0,
        'remorse': 0.0,
        'sad': 0.0,
        'surprise': 0.0,
        'neutral': 0.0
    }

    for i in range(0, video_sentiment_final.__len__()-1):
        for emotion in video_sentiment_final[i].keys():
            emotion_finals[emotion] += video_sentiment_final[i].get(emotion)

    for emotion in emotion_finals:
        emotion_finals[emotion] /= video_sentiment_final.__len__()

    emotion_finals = {key: value for key, value in emotion_finals.items() if value != 0.0}

    print("Processing Completed!!")

    payload = {
        'from': 'gradio',
        'emotions_final': emotion_finals,
        'body_language': body_language,
        'distraction_rate': distraction_rate,
        'formatted_response': formatted_response,
        'total_transcript_sentiment': total_transcript_sentiment
    }

    response = requests.post('http://127.0.0.1:5000/interview', json=payload)

    return str(final_output), frames_images, total_transcript_sentiment, audio_divide_sentiment, formatted_response, video_sentiment_markdown, emotion_finals, body_language, {'Distraction Rate': distraction_rate}


with gr.Blocks(theme=theme, css=".gradio-container {  background: rgba(255, 255, 255, 0.2) !important; box-shadow: 0 8px 32px 0 rgba( 31, 38, 135, 0.37 ) !important; backdrop-filter: blur( 10px ) !important; -webkit-backdrop-filter: blur( 10px ) !important; border-radius: 10px !important; border: 1px solid rgba( 0, 0, 0, 0.5 ) !important;}") as Video:
    with gr.Column():
        gr.Markdown("""# Cross Model Machine Learning Model""")
        with gr.Row():
            gr.Markdown("""
                        ### 🤖 A cross-model ML model for video processing in healthcare sentiment analysis involves combining different machine learning models to analyze sentiments expressed in healthcare-related videos.
                        - Facial Expression Recognition Model [Google/vit-base-patch16-224-in21k](https://huggingface.co/google/vit-base-patch16-224-in21k) 😊😢😰
                        - Speech Recognition Model [OpenAI/Whisper](https://github.com/openai/whisper) 🗣️🎤 
                        - Text Analysis Model [RoBERTa-base-go-emotions](https://huggingface.co/SamLowe/roberta-base-go_emotions) 📝📜
                        - Contextual Understanding Model (Sentiment Analysis) 🔄🌐
                        """)
            gr.Markdown("""### By combining the outputs of these models, the cross-model approach aims to capture a more comprehensive view of the sentiment within the healthcare-related video. This way, healthcare providers can gain insights into patient experiences and emotions, facilitating better understanding and improvements in healthcare services. 👩‍⚕️📈👨‍⚕️ """)

        with gr.Row():
            with gr.Column():
                input_video = gr.Video(sources=["upload", "webcam"], format='mp4')
                button = gr.Button("Process", variant="primary")
                gr.Examples(inputs=input_video, examples=[os.path.join(os.path.dirname(__file__), "test_video_1.mp4")])
            with gr.Column():
                with gr.Row():
                    video_sentiment_final = gr.Label(label="Video Sentiment Score")
                    speech_emotions = gr.Label(label="Audio Emotion Score")
                with gr.Row():
                    overall_transcript_score = gr.Label(label="Overall Transcript Score")
                    body_language = gr.Label(label="Body Language")
                    distraction_rate = gr.Label(label="Distraction Rate")

        with gr.Column():
            frames_gallery = gr.Gallery(label="Video Frames", show_label=True, elem_id="gallery", columns=[3], rows=[1], object_fit="contain", height="auto")
            with gr.Accordion(label="JSON detailed Responses", open=False):
                json_output = gr.Textbox(label="JSON Output", info="Overall scores of the above video in segments.", show_label=True, lines=5, show_copy_button=True, interactive=False)
                audio_sentiment = gr.Textbox(label="Audio Sentiments", info="Outputs of Audio Processing from the video.", show_label=True, lines=5, show_copy_button=True, interactive=False)
                video_sentiment_markdown = gr.Textbox(label="Video Sentiments", info="Outputs of Video Frames processing from the video.", show_label=True, lines=5, show_copy_button=True, interactive=False)

    button.click(
        fn=video_to_audio,
        inputs=input_video,
        outputs=[json_output, frames_gallery, overall_transcript_score, audio_sentiment, speech_emotions, video_sentiment_markdown, video_sentiment_final, body_language, distraction_rate]
    )

Video.launch()