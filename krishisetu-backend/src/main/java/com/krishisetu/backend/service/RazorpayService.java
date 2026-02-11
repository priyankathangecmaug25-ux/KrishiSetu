package com.krishisetu.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RazorpayClient client;

    @PostConstruct
    public void init() throws RazorpayException {
        // Initialize Razorpay client with keys
        // Note: Ideally, these should be checked for validity, but we'll assume valid
        // config for now
        this.client = new RazorpayClient(keyId, keySecret);
    }

    public Order createOrder(double amount, String currency, String receipt) throws RazorpayException {
        JSONObject options = new JSONObject();
        options.put("amount", (int) (amount * 100)); // Amount in paise
        options.put("currency", currency);
        options.put("receipt", receipt);
        return client.orders.create(options);
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) throws RazorpayException {
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", orderId);
        options.put("razorpay_payment_id", paymentId);
        options.put("razorpay_signature", signature);
        return Utils.verifyPaymentSignature(options, keySecret);
    }

    public String getKeyId() {
        return keyId;
    }
}
