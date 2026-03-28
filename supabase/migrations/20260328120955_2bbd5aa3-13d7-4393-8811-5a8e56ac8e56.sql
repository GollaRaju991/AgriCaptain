
-- Insert sample vehicle listings for testing
-- Using a temporary function to insert test data with proper user_id
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    INSERT INTO public.vehicle_listings (user_id, owner_name, owner_phone, vehicle_type, vehicle_name, model_year, daily_rate, condition, availability, country, state, district, mandal, village, latitude, longitude, location_address, description) VALUES
    (test_user_id, 'Ramesh Kumar', '9912345678', 'Tractor', 'John Deere 5050D', '2023', 1500, 'Excellent', 'Available', 'IN', 'TG', 'HYD', 'Rajendranagar', 'Attapur', 17.3616, 78.4176, 'Attapur, Hyderabad, Telangana', 'Well maintained tractor for rent'),
    (test_user_id, 'Suresh Reddy', '9987654321', 'Auto', 'Bajaj RE', '2022', 800, 'Good', 'Available', 'IN', 'TG', 'HYD', 'Mehdipatnam', 'Tolichowki', 17.3950, 78.4250, 'Mehdipatnam, Hyderabad, Telangana', 'Auto available for agricultural transport'),
    (test_user_id, 'Venkat Rao', '9876543210', 'Mini Truck', 'Tata Ace', '2021', 1200, 'Good', 'Available', 'IN', 'TG', 'RNG', 'Warangal Rural', 'Kazipet', 17.9784, 79.5941, 'Kazipet, Warangal, Telangana', 'Mini truck for crop transport'),
    (test_user_id, 'Prakash Singh', '9765432109', 'Lorry', 'Ashok Leyland Ecomet', '2020', 3000, 'Excellent', 'Available', 'IN', 'TG', 'KNR', 'Karimnagar Urban', 'Karimnagar', 18.4386, 79.1288, 'Karimnagar, Telangana', 'Heavy load lorry for farm produce'),
    (test_user_id, 'Raju Goud', '9654321098', 'Tractor', 'Mahindra 575 DI', '2022', 1300, 'Good', 'Available', 'IN', 'TG', 'NLG', 'Nalgonda', 'Nalgonda Town', 17.0583, 79.2671, 'Nalgonda, Telangana', 'Tractor available daily/weekly rent');
  END IF;
END $$;
