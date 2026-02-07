
export interface PaymentAdapter {
    /**
     * Generate parameters for binding a card
     * @param targetPlanId Optional plan ID to upgrade to immediately after binding
     */
    createCardBindingParams(tenantId: string, email: string, returnUrl: string, clientRedirectUrl?: string, targetPlanId?: string): Record<string, string>;

    /**
     * Verify the signature (CheckMacValue) of the callback data
     */
    verifySignature(data: Record<string, string>): boolean;

    /**
     * Generate parameters for B2C one-time payment (AioCheckOut)
     */
    createOrder(orderId: string, amount: number, itemName: string, returnUrl: string, clientBackUrl: string): Record<string, string>;
}
