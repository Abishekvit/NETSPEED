import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import os

# 1. Generate Synthetic Dataset
def generate_data(n_samples=2000):
    np.random.seed(42)
    locations = ['AB1', 'AB2', 'AB3', 'Library', 'Food Court', 'Sports Complex', 'Hostel D1', 'Hostel D2']
    weathers = ['Sunny', 'Cloudy', 'Rainy', 'Overcast']
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    data = {
        'location': np.random.choice(locations, n_samples),
        'hour': np.random.randint(0, 24, n_samples),
        'day_of_week': np.random.choice(days, n_samples),
        'is_weekend': np.random.randint(0, 2, n_samples),
        'is_holiday': np.random.choice([0, 1], n_samples, p=[0.9, 0.1]),
        'is_event': np.random.choice([0, 1], n_samples, p=[0.95, 0.05]),
        'weather': np.random.choice(weathers, n_samples),
        'distance_to_tower': np.random.uniform(5, 150, n_samples),
        'num_users': np.random.randint(1, 500, n_samples),
        'signal_strength': np.random.uniform(-90, -30, n_samples),
        'network_traffic': np.random.uniform(0.1, 1.0, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Target variable: download_speed (Mbps)
    # Base speed 100
    df['download_speed'] = 100.0
    
    # Apply factors
    # Signal strength factor
    df['download_speed'] *= (1.0 - (abs(df['signal_strength'] + 30) / 60.0))
    # Distance factor
    df['download_speed'] *= (1.0 / (1.0 + (df['distance_to_tower'] / 50.0)**2))
    # Congestion factor
    df['download_speed'] *= (1.0 - (df['num_users'] / 500.0) * df['network_traffic'])
    # Time factor (Peak hours)
    df.loc[(df['hour'] >= 10) & (df['hour'] <= 16), 'download_speed'] *= 0.6
    df.loc[(df['hour'] >= 19) & (df['hour'] <= 22), 'download_speed'] *= 0.7
    # Event factor
    df.loc[df['is_event'] == 1, 'download_speed'] *= 0.3
    # Weather factor
    df.loc[df['weather'] == 'Rainy', 'download_speed'] *= 0.7
    
    # Add noise
    df['download_speed'] *= np.random.uniform(0.9, 1.1, n_samples)
    df['download_speed'] = df['download_speed'].clip(lower=0.5)
    
    return df

# 2. Feature Engineering
def feature_engineering(df):
    # Peak hours: 10-16 and 19-22
    df['is_peak_hour'] = df['hour'].apply(lambda x: 1 if (10 <= x <= 16) or (19 <= x <= 22) else 0)
    # Night time: 0-6
    df['is_night'] = df['hour'].apply(lambda x: 1 if (0 <= x <= 6) else 0)
    # Lunch time: 12-14
    df['is_lunch_time'] = df['hour'].apply(lambda x: 1 if (12 <= x <= 14) else 0)
    # Crowd level: Low, Medium, High
    df['crowd_level'] = pd.cut(df['num_users'], bins=[0, 100, 300, 501], labels=[0, 1, 2]).astype(int)
    # Signal quality: Poor, Fair, Good, Excellent
    df['signal_quality'] = pd.cut(df['signal_strength'], bins=[-91, -80, -70, -60, -29], labels=[0, 1, 2, 3]).astype(int)
    
    return df

# 3. Main Training Script
def train():
    print("Generating synthetic data...")
    df = generate_data()
    
    print("Performing feature engineering...")
    df = feature_engineering(df)
    
    # 4. Encoding Categorical Variables
    print("Encoding categorical variables...")
    le_location = LabelEncoder()
    df['location_enc'] = le_location.fit_transform(df['location'])
    
    le_weather = LabelEncoder()
    df['weather_enc'] = le_weather.fit_transform(df['weather'])
    
    le_day = LabelEncoder()
    df['day_enc'] = le_day.fit_transform(df['day_of_week'])
    
    # Save encoders
    joblib.dump(le_location, 'le_location.pkl')
    joblib.dump(le_weather, 'le_weather.pkl')
    joblib.dump(le_day, 'le_day.pkl')
    
    # 5. Split Dataset
    features = [
        'location_enc', 'hour', 'day_enc', 'is_weekend', 'is_holiday', 
        'is_event', 'weather_enc', 'distance_to_tower', 'num_users', 
        'signal_strength', 'network_traffic', 'is_peak_hour', 
        'is_night', 'is_lunch_time', 'crowd_level', 'signal_quality'
    ]
    X = df[features]
    y = df['download_speed']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 6. Train Models
    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
        'XGBoost': XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
    }
    
    best_model = None
    best_r2 = -float('inf')
    results = {}
    
    print("\nEvaluating Models:")
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        results[name] = {'MAE': mae, 'RMSE': rmse, 'R2': r2}
        print(f"{name}: MAE={mae:.4f}, RMSE={rmse:.4f}, R2={r2:.4f}")
        
        if r2 > best_r2:
            best_r2 = r2
            best_model = model
            best_model_name = name
            
    # 7. Save Best Model
    print(f"\nBest Model: {best_model_name} with R2={best_r2:.4f}")
    joblib.dump(best_model, 'network_speed_model.pkl')
    print("Model saved as network_speed_model.pkl")

if __name__ == "__main__":
    train()
