import { Router } from 'express';
import { notifyCustomerOneWay, notifyCustomerRoundTrip, notifyCustomerLocal } from '../controllers/NotifyCenter';
import { verifyOtpController } from '../controllers/OtpController';
import { notifyAdminLocal, notifyAdminOneWay, notifyAdminRoundTrip } from '../utils/AdminAlert';

const router = Router();

router.post('/notify-oneway', verifyOtpController, notifyCustomerOneWay, notifyAdminOneWay);

router.post('/notify-roundtrip', verifyOtpController, notifyCustomerRoundTrip, notifyAdminRoundTrip);

router.post('/notify-local', verifyOtpController, notifyCustomerLocal, notifyAdminLocal);

export default router;