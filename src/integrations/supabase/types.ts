export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          nom: string
          created_at: string | null
        }
        Insert: {
          id?: string
          nom: string
          created_at?: string | null
        }
        Update: {
          id?: string
          nom?: string
          created_at?: string | null
        }
        Relationships: []
      }
      produits: {
        Row: {
          id: string
          nom: string
          description: string
          prix: number
          categorie_id: string | null
          image_url: string
          stock: number
          featured: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          nom: string
          description: string
          prix: number
          categorie_id?: string | null
          image_url?: string
          stock?: number
          featured?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          nom?: string
          description?: string
          prix?: number
          categorie_id?: string | null
          image_url?: string
          stock?: number
          featured?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produits_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      commandes: {
        Row: {
          id: string
          client_nom: string
          client_prenom: string
          telephone: string
          statut: string
          payee: boolean | null
          total: number
          date_commande: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          client_nom: string
          client_prenom: string
          telephone: string
          statut?: string
          payee?: boolean | null
          total: number
          date_commande?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          client_nom?: string
          client_prenom?: string
          telephone?: string
          statut?: string
          payee?: boolean | null
          total?: number
          date_commande?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      commande_produits: {
        Row: {
          commande_id: string
          produit_id: string
          quantite: number
          nom: string
          prix: number
          created_at: string | null
        }
        Insert: {
          commande_id: string
          produit_id: string
          quantite: number
          nom: string
          prix: number
          created_at?: string | null
        }
        Update: {
          commande_id?: string
          produit_id?: string
          quantite?: number
          nom?: string
          prix?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commande_produits_commande_id_fkey"
            columns: ["commande_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commande_produits_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never