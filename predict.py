import sys
import json
import random
import os

# Try to import ML libraries, but provide a fallback if they are missing
try:
    import joblib
    import pandas as pd
    HAS_ML_LIBS = True
except ImportError:
    HAS_ML_LIBS = False

def simulate_prediction(params):
    """Fallback simulation logic when ML models are not available."""
    hour = int(params.get('hour', 12))
    is_event = int(params.get('is_event', 0))
    num_users = int(params.get('num_connected_users', 50))
    signal_strength = float(params.get('signal_strength', -50))
    weather = params.get('weather', 'Sunny')
    distance = float(params.get('distance_to_tower', 10.0))
    
    # Base speed starts at 100 Mbps
    base_speed = 100.0
    
    # Factor: Signal Strength (Logarithmic drop)
    signal_factor = max(0.1, 1.0 - (abs(signal_strength + 30) / 60.0))
    
    # Factor: Distance (Inverse square law approximation)
    distance_factor = 1.0 / (1.0 + (distance / 50.0)**2)
    
    # Factor: User Density (Congestion)
    congestion_factor = max(0.05, 1.0 - (num_users / 500.0))
    
    # Factor: Time of Day (Peak hours)
    time_factor = 0.6 if (10 <= hour <= 16) or (19 <= hour <= 22) else 1.0
            
    # Factor: Day Type & Weather
    event_factor = 0.3 if is_event else 1.0
    weather_factor = 0.7 if weather == 'Rainy' else 1.0
    
    # Calculate Final Download Speed
    download_speed = base_speed * signal_factor * distance_factor * congestion_factor * time_factor * event_factor * weather_factor
    download_speed *= (0.95 + random.random() * 0.1) # Noise
    
    return round(max(0.5, download_speed), 2)

def main():
    try:
        # 1. Parse Input JSON
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No input parameters provided"}))
            return
            
        params = json.loads(sys.argv[1])
        
        # 2. Check if model files exist and ML libs are available
        model_path = 'network_speed_model.pkl'
        if HAS_ML_LIBS and os.path.exists(model_path):
            try:
                # Load Model and Encoders
                model = joblib.load(model_path)
                le_location = joblib.load('le_location.pkl')
                le_weather = joblib.load('le_weather.pkl')
                le_day = joblib.load('le_day.pkl')

                # Extract parameters
                location = params.get('location', 'AB1')
                hour = int(params.get('hour', 12))
                day_of_week = params.get('day_of_week', 'Monday')
                is_weekend = int(params.get('is_weekend', 0))
                is_holiday = int(params.get('is_holiday', 0))
                is_event = int(params.get('is_event', 0))
                weather = params.get('weather', 'Sunny')
                distance_to_tower = float(params.get('distance_to_tower', 10.0))
                num_users = int(params.get('num_connected_users', 50))
                signal_strength = float(params.get('signal_strength', -50))
                network_traffic = float(params.get('network_traffic', 0.5))

                # Feature Engineering
                is_peak_hour = 1 if (10 <= hour <= 16) or (19 <= hour <= 22) else 0
                is_night = 1 if (0 <= hour <= 6) else 0
                is_lunch_time = 1 if (12 <= hour <= 14) else 0
                crowd_level = 0 if num_users <= 100 else (1 if num_users <= 300 else 2)
                signal_quality = 0 if signal_strength <= -80 else (1 if signal_strength <= -70 else (2 if signal_strength <= -60 else 3))

                # Encoding
                def safe_transform(le, val):
                    try: return le.transform([val])[0]
                    except: return 0

                location_enc = safe_transform(le_location, location)
                weather_enc = safe_transform(le_weather, weather)
                day_enc = safe_transform(le_day, day_of_week)

                # Prepare Input Data
                features = [
                    'location_enc', 'hour', 'day_enc', 'is_weekend', 'is_holiday', 
                    'is_event', 'weather_enc', 'distance_to_tower', 'num_users', 
                    'signal_strength', 'network_traffic', 'is_peak_hour', 
                    'is_night', 'is_lunch_time', 'crowd_level', 'signal_quality'
                ]
                
                input_data = pd.DataFrame([[
                    location_enc, hour, day_enc, is_weekend, is_holiday, 
                    is_event, weather_enc, distance_to_tower, num_users, 
                    signal_strength, network_traffic, is_peak_hour, 
                    is_night, is_lunch_time, crowd_level, signal_quality
                ]], columns=features)

                # Predict
                prediction = model.predict(input_data)[0]
                
                print(json.dumps({
                    "download_speed": round(float(prediction), 2),
                    "upload_speed": round(float(prediction) * 0.5, 2),
                    "source": "ML Model"
                }))
                return
            except Exception as e:
                # If model fails, fall back to simulation
                pass

        # 3. Fallback to Simulation
        download_speed = simulate_prediction(params)
        print(json.dumps({
            "download_speed": download_speed,
            "upload_speed": round(download_speed * 0.5, 2),
            "source": "Neural Simulation"
        }))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
