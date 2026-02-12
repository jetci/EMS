// Copy script นี้ไปวางใน Browser Console (F12)
// หลังจาก Login แล้ว

(async function testProfileSave() {
    console.log('=== Testing Profile Save ===');
    
    const token = localStorage.getItem('wecare_token');
    
    if (!token) {
        console.error('❌ No token found. Please login first.');
        return;
    }
    
    console.log('✅ Token found:', token.substring(0, 20) + '...');
    
    // Small test image (1x1 pixel PNG)
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const payload = {
        name: 'Test User',
        phone: '0812345678',
        profileImageUrl: testImage
    };
    
    console.log('📦 Payload:', {
        name: payload.name,
        phone: payload.phone,
        imageSize: testImage.length + ' chars'
    });
    
    try {
        console.log('📤 Sending PUT /api/auth/profile...');
        
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📥 Response Status:', response.status, response.statusText);
        console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log('📥 Response Body (raw):', text);
        
        if (response.ok) {
            try {
                const data = JSON.parse(text);
                console.log('✅ SUCCESS! Parsed data:', data);
                console.log('✅ User ID:', data.id);
                console.log('✅ Name:', data.name);
                console.log('✅ Has profileImageUrl:', !!data.profileImageUrl);
                
                if (data.profileImageUrl) {
                    console.log('✅ Image URL length:', data.profileImageUrl.length);
                }
            } catch (e) {
                console.error('❌ Failed to parse JSON:', e);
            }
        } else {
            console.error('❌ Request failed!');
            console.error('❌ Status:', response.status);
            console.error('❌ Response:', text);
            
            // Check if it's HTML (redirect)
            if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                console.error('❌ Response is HTML - probably redirected to login page');
            }
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
    
    console.log('=== Test Complete ===');
})();
