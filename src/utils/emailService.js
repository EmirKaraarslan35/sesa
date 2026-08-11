import emailjs from '@emailjs/browser';

// EmailJS Credentials
const SERVICE_ID = 'service_ylt17se';
const TEMPLATE_ID = 'template_7hiocbd';
const PUBLIC_KEY = 'id4wiv_U7jNYFiHJa';

// EmailJS Initialization (optional, but good practice)
emailjs.init(PUBLIC_KEY);

/**
 * Gönderilen arızayı ilgili bölüm sorumlusuna e-posta olarak atar.
 * 
 * @param {Object} issueData Arıza verileri (makine_ad, makine_kod, bolum_ad, aciklama vs.)
 * @param {String} recipientEmail Alıcı sorumlunun e-posta adresi
 */
export const sendIssueEmail = async (issueData, recipientEmail) => {
  try {
    const templateParams = {
      alici_email: recipientEmail,
      makine_ad: issueData.makine_ad,
      makine_kod: issueData.makine_kod,
      bolum_ad: issueData.bolum_ad,
      aciklama: issueData.aciklama,
      // Tarihi gün/ay/yıl saat:dakika formatında göster
      tarih: new Date().toLocaleString('tr-TR')
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    
    console.log('Email başarıyla gönderildi!', response.status, response.text);
    return true;
  } catch (error) {
    console.error('Email gönderme başarısız oldu:', error);
    return false;
  }
};
