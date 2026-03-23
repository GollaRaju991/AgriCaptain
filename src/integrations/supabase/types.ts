export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address: string
          address_type: string
          city: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          address_type: string
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          phone: string
          pincode: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          address_type?: string
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      delivery_tracking: {
        Row: {
          courier_name: string | null
          created_at: string
          delivered_at: string | null
          delivery_notes: string | null
          id: string
          order_id: string
          out_for_delivery_at: string | null
          shipped_at: string | null
          status: string
          tracking_number: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          courier_name?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_notes?: string | null
          id?: string
          order_id: string
          out_for_delivery_at?: string | null
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          courier_name?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_notes?: string | null
          id?: string
          order_id?: string
          out_for_delivery_at?: string | null
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_workers: {
        Row: {
          availability: string
          category: string
          created_at: string
          daily_rate: number | null
          district: string | null
          experience: string | null
          id: string
          is_active: boolean
          mandal: string | null
          name: string
          phone: string
          photo_url: string | null
          rating: number | null
          state: string | null
          updated_at: string
          village: string | null
          worker_types: string[]
        }
        Insert: {
          availability?: string
          category?: string
          created_at?: string
          daily_rate?: number | null
          district?: string | null
          experience?: string | null
          id?: string
          is_active?: boolean
          mandal?: string | null
          name: string
          phone: string
          photo_url?: string | null
          rating?: number | null
          state?: string | null
          updated_at?: string
          village?: string | null
          worker_types?: string[]
        }
        Update: {
          availability?: string
          category?: string
          created_at?: string
          daily_rate?: number | null
          district?: string | null
          experience?: string | null
          id?: string
          is_active?: boolean
          mandal?: string | null
          name?: string
          phone?: string
          photo_url?: string | null
          rating?: number | null
          state?: string | null
          updated_at?: string
          village?: string | null
          worker_types?: string[]
        }
        Relationships: []
      }
      farmer_crops: {
        Row: {
          availability_location: string
          created_at: string
          crop_images: string[] | null
          crop_name: string
          harvest_date: string | null
          id: string
          location_address: string | null
          price: string
          quality_grade: string
          quantity: string
          sell_type: string
          seller_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_location?: string
          created_at?: string
          crop_images?: string[] | null
          crop_name: string
          harvest_date?: string | null
          id?: string
          location_address?: string | null
          price: string
          quality_grade?: string
          quantity: string
          sell_type?: string
          seller_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_location?: string
          created_at?: string
          crop_images?: string[] | null
          crop_name?: string
          harvest_date?: string | null
          id?: string
          location_address?: string | null
          price?: string
          quality_grade?: string
          quantity?: string
          sell_type?: string
          seller_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farmer_crops_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmer_crops_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_card_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          gift_card_id: string
          id: string
          order_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          gift_card_id: string
          id?: string
          order_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          gift_card_id?: string
          id?: string
          order_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_card_transactions_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_card_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          balance: number
          code: string
          created_at: string
          expires_at: string | null
          id: string
          initial_amount: number
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          initial_amount: number
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          initial_amount?: number
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          order_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          order_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          order_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          estimated_delivery: string | null
          id: string
          items: Json
          order_number: string
          payment_method: string
          payment_status: string
          shipping_address: Json
          status: string
          total_amount: number
          tracking_updates: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          items: Json
          order_number: string
          payment_method: string
          payment_status?: string
          shipping_address: Json
          status?: string
          total_amount: number
          tracking_updates?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          items?: Json
          order_number?: string
          payment_method?: string
          payment_status?: string
          shipping_address?: Json
          status?: string
          total_amount?: number
          tracking_updates?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          created_at: string | null
          expires_at: string
          failed_attempts: number
          first_sent_at: string | null
          last_attempt_at: string | null
          otp: string
          phone: string
          send_count: number
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          failed_attempts?: number
          first_sent_at?: string | null
          last_attempt_at?: string | null
          otp: string
          phone: string
          send_count?: number
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          failed_attempts?: number
          first_sent_at?: string | null
          last_attempt_at?: string | null
          otp?: string
          phone?: string
          send_count?: number
          verified?: boolean | null
        }
        Relationships: []
      }
      product_specifications: {
        Row: {
          active_ingredients: string | null
          application_method: string | null
          composition: string | null
          created_at: string
          dosage: string | null
          expiry_date: string | null
          frequency_of_use: string | null
          id: string
          manufacturing_date: string | null
          package_size: string | null
          product_id: string
          protective_equipment: string | null
          safety_instructions: string | null
          storage_instructions: string | null
          suitable_crops: string[] | null
          target_pests: string[] | null
          updated_at: string
          user_id: string
          waiting_period: string | null
        }
        Insert: {
          active_ingredients?: string | null
          application_method?: string | null
          composition?: string | null
          created_at?: string
          dosage?: string | null
          expiry_date?: string | null
          frequency_of_use?: string | null
          id?: string
          manufacturing_date?: string | null
          package_size?: string | null
          product_id: string
          protective_equipment?: string | null
          safety_instructions?: string | null
          storage_instructions?: string | null
          suitable_crops?: string[] | null
          target_pests?: string[] | null
          updated_at?: string
          user_id: string
          waiting_period?: string | null
        }
        Update: {
          active_ingredients?: string | null
          application_method?: string | null
          composition?: string | null
          created_at?: string
          dosage?: string | null
          expiry_date?: string | null
          frequency_of_use?: string | null
          id?: string
          manufacturing_date?: string | null
          package_size?: string | null
          product_id?: string
          protective_equipment?: string | null
          safety_instructions?: string | null
          storage_instructions?: string | null
          suitable_crops?: string[] | null
          target_pests?: string[] | null
          updated_at?: string
          user_id?: string
          waiting_period?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "seller_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aadhar_card: string | null
          address: string | null
          created_at: string
          id: string
          name: string
          pan_card: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          aadhar_card?: string | null
          address?: string | null
          created_at?: string
          id: string
          name: string
          pan_card?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          aadhar_card?: string | null
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          pan_card?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_amount: number
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_user_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          bonus_amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          bonus_amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      return_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          order_id: string
          picked_up_at: string | null
          pickup_scheduled_at: string | null
          reason: string
          refund_amount: number
          refund_completed_at: string | null
          refund_status: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          order_id: string
          picked_up_at?: string | null
          pickup_scheduled_at?: string | null
          reason?: string
          refund_amount?: number
          refund_completed_at?: string | null
          refund_status?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          order_id?: string
          picked_up_at?: string | null
          pickup_scheduled_at?: string | null
          reason?: string
          refund_amount?: number
          refund_completed_at?: string | null
          refund_status?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_cards: {
        Row: {
          bank_name: string | null
          card_holder_name: string
          card_number_last4: string
          card_type: string
          created_at: string
          expiry_month: number
          expiry_year: number
          id: string
          is_default: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_name?: string | null
          card_holder_name: string
          card_number_last4: string
          card_type?: string
          created_at?: string
          expiry_month: number
          expiry_year: number
          id?: string
          is_default?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_name?: string | null
          card_holder_name?: string
          card_number_last4?: string
          card_type?: string
          created_at?: string
          expiry_month?: number
          expiry_year?: number
          id?: string
          is_default?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_upi: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          provider: string | null
          updated_at: string
          upi_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          provider?: string | null
          updated_at?: string
          upi_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          provider?: string | null
          updated_at?: string
          upi_id?: string
          user_id?: string
        }
        Relationships: []
      }
      seller_products: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          crop_type: string | null
          delivery_available: boolean | null
          delivery_charge: number | null
          delivery_days: string | null
          description: string | null
          discount_percent: number | null
          id: string
          mrp_price: number
          product_images: string[] | null
          product_name: string
          product_type: string | null
          season: string | null
          seller_id: string
          selling_price: number
          shelf_life: string | null
          status: string
          stock_quantity: number
          sub_category: string | null
          suitable_soil: string | null
          unit_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          crop_type?: string | null
          delivery_available?: boolean | null
          delivery_charge?: number | null
          delivery_days?: string | null
          description?: string | null
          discount_percent?: number | null
          id?: string
          mrp_price: number
          product_images?: string[] | null
          product_name: string
          product_type?: string | null
          season?: string | null
          seller_id: string
          selling_price: number
          shelf_life?: string | null
          status?: string
          stock_quantity?: number
          sub_category?: string | null
          suitable_soil?: string | null
          unit_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          crop_type?: string | null
          delivery_available?: boolean | null
          delivery_charge?: number | null
          delivery_days?: string | null
          description?: string | null
          discount_percent?: number | null
          id?: string
          mrp_price?: number
          product_images?: string[] | null
          product_name?: string
          product_type?: string | null
          season?: string | null
          seller_id?: string
          selling_price?: number
          shelf_life?: string | null
          status?: string
          stock_quantity?: number
          sub_category?: string | null
          suitable_soil?: string | null
          unit_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          aadhaar_document_url: string | null
          aadhaar_number: string
          address: string
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_ifsc: string | null
          created_at: string
          district: string | null
          email: string | null
          farm_location: string | null
          google_map_location: string | null
          id: string
          name: string
          pan_card_url: string | null
          phone: string
          photo_url: string | null
          pincode: string
          seller_sub_type: string | null
          seller_type: string
          shop_banner_url: string | null
          shop_farm_name: string | null
          state: string | null
          status: string
          updated_at: string
          user_id: string
          village: string | null
        }
        Insert: {
          aadhaar_document_url?: string | null
          aadhaar_number: string
          address: string
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          farm_location?: string | null
          google_map_location?: string | null
          id?: string
          name: string
          pan_card_url?: string | null
          phone: string
          photo_url?: string | null
          pincode: string
          seller_sub_type?: string | null
          seller_type: string
          shop_banner_url?: string | null
          shop_farm_name?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id: string
          village?: string | null
        }
        Update: {
          aadhaar_document_url?: string | null
          aadhaar_number?: string
          address?: string
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          farm_location?: string | null
          google_map_location?: string | null
          id?: string
          name?: string
          pan_card_url?: string | null
          phone?: string
          photo_url?: string | null
          pincode?: string
          seller_sub_type?: string | null
          seller_type?: string
          shop_banner_url?: string | null
          shop_farm_name?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      vendor_details: {
        Row: {
          created_at: string
          district: string | null
          email: string | null
          id: string
          license_number: string | null
          mandal: string | null
          phone: string | null
          seller_id: string
          shop_address: string | null
          state: string | null
          updated_at: string
          user_id: string
          vendor_name: string
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          license_number?: string | null
          mandal?: string | null
          phone?: string | null
          seller_id: string
          shop_address?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          vendor_name: string
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          license_number?: string | null
          mandal?: string | null
          phone?: string | null
          seller_id?: string
          shop_address?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          vendor_name?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_details_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_details_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_order_alerts: {
        Row: {
          created_at: string
          customer_address: string | null
          id: string
          is_read: boolean
          order_id: string
          product_name: string
          quantity: number
          seller_id: string | null
          status: string
          total_amount: number
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          id?: string
          is_read?: boolean
          order_id: string
          product_name: string
          quantity?: number
          seller_id?: string | null
          status?: string
          total_amount?: number
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          id?: string
          is_read?: boolean
          order_id?: string
          product_name?: string
          quantity?: number
          seller_id?: string | null
          status?: string
          total_amount?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_order_alerts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_order_alerts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_order_alerts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_order_alerts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_details"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_farmer_crops: {
        Row: {
          availability_location: string | null
          created_at: string | null
          crop_images: string[] | null
          crop_name: string | null
          harvest_date: string | null
          id: string | null
          location_address: string | null
          price: string | null
          quality_grade: string | null
          quantity: string | null
          sell_type: string | null
          seller_id: string | null
        }
        Insert: {
          availability_location?: string | null
          created_at?: string | null
          crop_images?: string[] | null
          crop_name?: string | null
          harvest_date?: string | null
          id?: string | null
          location_address?: string | null
          price?: string | null
          quality_grade?: string | null
          quantity?: string | null
          sell_type?: string | null
          seller_id?: string | null
        }
        Update: {
          availability_location?: string | null
          created_at?: string | null
          crop_images?: string[] | null
          crop_name?: string | null
          harvest_date?: string | null
          id?: string | null
          location_address?: string | null
          price?: string | null
          quality_grade?: string | null
          quantity?: string | null
          sell_type?: string | null
          seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_crops_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmer_crops_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      public_sellers: {
        Row: {
          address: string | null
          created_at: string | null
          district: string | null
          id: string | null
          name: string | null
          phone: string | null
          photo_url: string | null
          pincode: string | null
          seller_type: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          village: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          district?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          seller_type?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          village?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          district?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          photo_url?: string | null
          pincode?: string | null
          seller_type?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          village?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_otps: { Args: never; Returns: undefined }
      generate_gift_card_code: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      validate_referral_code: { Args: { code: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
