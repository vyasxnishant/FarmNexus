export interface Step {
  number: number
  title: string
  titleHi: string
  description: string
  descriptionHi: string
}

export const steps: Step[] = [
  {
    number: 1,
    title: 'Create Lot',
    titleHi: 'लॉट बनाएं',
    description: 'List your produce with quantity, quality grade, and location. Takes under a minute.',
    descriptionHi: 'अपनी उपज की मात्रा, गुणवत्ता ग्रेड और स्थान सहित सूची बनाएं। एक मिनट से भी कम समय लगता है।',
  },
  {
    number: 2,
    title: 'Get Matched',
    titleHi: 'मिलान पाएं',
    description: 'Our system finds verified buyers looking for exactly what you grow.',
    descriptionHi: 'हमारा सिस्टम सत्यापित खरीदारों को खोजता है जो ठीक वही चाहते हैं जो आप उगाते हैं।',
  },
  {
    number: 3,
    title: 'Receive Offers',
    titleHi: 'ऑफ़र प्राप्त करें',
    description: 'Compare multiple offers side by side. See price, payment terms, and buyer ratings.',
    descriptionHi: 'कई ऑफ़रों की साथ-साथ तुलना करें। कीमत, भुगतान शर्तें और खरीदार रेटिंग देखें।',
  },
  {
    number: 4,
    title: 'Arrange Logistics',
    titleHi: 'लॉजिस्टिक्स तय करें',
    description: 'Coordinate pickup and delivery through our network of transport partners.',
    descriptionHi: 'हमारे ट्रांसपोर्ट पार्टनर नेटवर्क के माध्यम से पिकअप और डिलीवरी का समन्वय करें।',
  },
  {
    number: 5,
    title: 'Track Payment',
    titleHi: 'भुगतान ट्रैक करें',
    description: 'Payments go directly to your bank account via UPI. Track every rupee in real time.',
    descriptionHi: 'भुगतान UPI के माध्यम से सीधे आपके बैंक खाते में जाता है। हर रुपये को रियल टाइम में ट्रैक करें।',
  },
]
