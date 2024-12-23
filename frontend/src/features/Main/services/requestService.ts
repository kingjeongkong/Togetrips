import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Request, RequestUserProfile } from '../types/requestTypes';
import { toast } from 'react-toastify';

export const requestService = {
  async sendRequest(
    currentLoggedInUserID: string,
    receiverID: string,
    message?: string
  ): Promise<boolean> {
    try {
      const newRequest = {
        senderID: currentLoggedInUserID,
        receiverID,
        status: 'pending',
        message,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'requests'), newRequest);
      toast.success('Request sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Failed to send request. Please try again.');
      return false;
    }
  },

  async getMyRequests(
    currentLoggedInUserID: string
  ): Promise<(Request & { sender: RequestUserProfile })[]> {
    try {
      const requestsQuery = query(
        collection(db, 'requests'),
        where('receiverID', '==', currentLoggedInUserID),
        where('status', '==', 'pending')
      );
      const requestsSnapshot = await getDocs(requestsQuery);

      const requests = await Promise.all(
        requestsSnapshot.docs.map(async (requestDoc) => {
          const request = { id: requestDoc.id, ...requestDoc.data() } as Request;
          const senderDoc = await getDoc(doc(db, 'users', request.senderID));
          const senderData = senderDoc.data() as RequestUserProfile;

          return {
            ...request,
            sender: senderData
          };
        })
      );

      return requests;
    } catch (error) {
      //ToDo : 에러 처리
      console.error('Error fetching requests:', error);
      throw new Error('Failed to fetch requests');
      return [];
    }
  },

  async acceptRequest(requestID: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'requests', requestID), {
        status: 'accepted'
      });
      return true; 
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request. Please try again.');
      return false;
    }
  },

  async declineRequest(requestID: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'requests', requestID), {
        status: 'declined'
      });
      return true;
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request. Please try again.');
      return false;
    }
  },

  async checkRequestByStatus(
    userID: string,
    otherUserID: string,
    status: 'pending' | ['accepted', 'declined']
  ): Promise<boolean> {
    try {
      const statusCondition = Array.isArray(status)
        ? where('status', 'in', status)
        : where('status', '==', status);

      const sentRequestQuery = query(
        collection(db, 'requests'),
        where('senderID', '==', userID),
        where('receiverID', '==', otherUserID),
        statusCondition
      );

      const receivedRequestQuery = query(
        collection(db, 'requests'),
        where('senderID', '==', otherUserID),
        where('receiverID', '==', userID),
        statusCondition
      );

      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentRequestQuery),
        getDocs(receivedRequestQuery)
      ]);

      return !sentSnapshot.empty || !receivedSnapshot.empty;
    } catch (error) {
      // ToDo : 에러 처리
      console.error('Error checking existing request:', error);
      return false;
    }
  }
};
