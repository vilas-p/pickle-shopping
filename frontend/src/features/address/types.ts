export interface AddressBookEntry {
  id: number;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  defaultAddress: boolean;
}