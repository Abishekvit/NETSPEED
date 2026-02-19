import sys
import json
import joblib
import numpy as np
import os

def main():
    try:
        # 1. Get arguments from Node.js
        if len(sys.argv) < 5:
            print(json.dumps({"error": "Missing arguments"}))
            return

        lat = float(sys.argv[1])
        lon = float(sys.argv[2])
        hour = int(sys.argv[3])
        day_type = sys.argv[4]

        # 2. Check if model files exist
        if not os.path.exists('network_speed_model.pkl') or not os.path.exists('day_type_encoder.pkl'):
            # Fallback mock prediction if files are missing
            # This allows the app to run while you upload your files
            mock_speed = 25.0 + (np.sin(hour/24 * np.pi) * 15)
            if day_type == 'Event': mock_speed *= 0.3
            print(json.dumps({"speed": mock_speed, "warning": "Model files not found, using mock logic"}))
            return

        # 3. Load your real models
        model = joblib.load('network_speed_model.pkl')
        le = joblib.load('day_type_encoder.pkl')

        # 4. Process Input
        day_encoded = le.transform([day_type])[0]
        
        # 5. Predict
        prediction = model.predict([[lat, lon, hour, day_encoded]])
        
        # 6. Output JSON
        print(json.dumps({"speed": float(prediction[0])}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
