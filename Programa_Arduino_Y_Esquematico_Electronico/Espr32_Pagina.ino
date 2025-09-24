#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN  5
#define RST_PIN 27

#define led_verde 13
#define led_rojo 26

#define buzzer 14

MFRC522 mfrc522(SS_PIN, RST_PIN);

String input;

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Lector inicializado...");
  pinMode(led_verde, OUTPUT);
  pinMode(led_rojo, OUTPUT);
  pinMode(buzzer,OUTPUT);
}

void loop() {
if(Serial.available()>0){

     input = Serial.readStringUntil('\n'); // Lee hasta encontrar un '\n' salto de linea
    input.trim();
    
    
    tone(buzzer, 1000); 
    delay(200);       
    noTone(buzzer);    
    if(input=="Autorizo"){

      //sonido
       //tone(buzzer, 1000); 
   // digitalWrite(buzzer,HIGH);
    //delay(2000);         
    //digitalWrite(buzzer,LOW);
    //noTone(buzzer);    
      //Fin de sonido


      
      digitalWrite(led_verde,HIGH);
      delay(2000);
      digitalWrite(led_verde,LOW);
    }
     if(input=="NoAutorizo"){

      digitalWrite(led_rojo,HIGH);
      delay(2000);
      digitalWrite(led_rojo,LOW);
    }
  }

  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(mfrc522.uid.uidByte[i], HEX);
    if (i < mfrc522.uid.size - 1) uid += " ";
  }
  uid.toUpperCase();

  Serial.println(uid);  //


  
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}