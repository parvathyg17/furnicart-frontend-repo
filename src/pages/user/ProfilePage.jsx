import "../../styles/account.css";

import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { Mail, Phone, Calendar, User, Gift, Copy } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { getProfile } from "../../features/profile/profileSlice";

import { useNavigate } from "react-router-dom";

import AccountLayout from "../../components/user/AccountLayout";

import { resolveMediaUrl } from "../../utils/mediaUrl";

import { fetchReferralMe } from "../../features/referral/referralAPI";
import { getDiscountTotalApi } from "../../features/profile/profileAPI";

export default function ProfilePage() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [referral, setReferral] = useState(null);

  const { profile, displayRevision } = useSelector((state) => state.profile);

  const[data,setData]=useState({discount_total:0})

  useEffect(()=>{
    async function loadData() {

      try{
        const res=await getDiscountTotalApi()
        setData(res)
        console.log(res)
        
      }
      catch(err){
        console.log(err)
      }
      
    }
    loadData()
  },[])

  useEffect(() => {
    dispatch(getProfile());

    fetchReferralMe()
      .then(setReferral)
      .catch(() => {
        setReferral(null);
      });
  }, [dispatch]);

  const referralLink = referral?.referral_token
    ? `${window.location.origin}/signup?ref=${referral.referral_token}`
    : "";

  const copyText = async (text, label) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy");
    }
  };

  if (!profile) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <AccountLayout>
      <div className="profile-wrapper">
        <div className="profile-banner"></div>

        <div className="profile-header">
          <div className="profile-left">
            <div className="profile-avatar">
              {profile.profile_image ? (
                <img
                  src={
                    resolveMediaUrl(profile.profile_image, displayRevision) ||
                    ""
                  }
                  alt=""
                />
              ) : (
                <div className="avatar-placeholder">
                  {profile.username?.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <h1>{profile.username}</h1>

              <p>Welcome to your account</p>
              {data && data.discount_total}
            </div>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/profile/edit")}
          >
            Edit Profile
          </button>
        </div>

        <div className="section-divider"></div>

        <div className="section-title">Personal Information</div>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-label">
              <User size={18} />
              Username
            </div>

            <div className="info-value">{profile.username}</div>
          </div>

          <div className="info-card">
            <div className="info-label">
              <Mail size={18} />
              Email Address
            </div>

            <div className="info-value-row">
              <div className="info-value">{profile.email}</div>

              <span
                className="edit-link"
                onClick={() => navigate("/profile/email/edit")}
              >
                Edit
              </span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-label">
              <Phone size={18} />
              Phone Number
            </div>

            <div className="info-value">{profile.phone || "Not Added"}</div>
          </div>

          <div className="info-card">
            <div className="info-label">
              <Calendar size={18} />
              Date Of Birth
            </div>

            <div className="info-value">
              {profile.date_of_birth || "Not Added"}
            </div>
          </div>
        </div>

        {referral?.program_active && (
          <>
            <div className="section-divider"></div>

            <div className="section-title referral-section-title">
              <Gift size={20} />
              Refer & Earn
            </div>

            <div className="referral-card">
              <p className="referral-lead">
                Invite friends and earn ₹{referral.referrer_reward_amount}{" "}
                wallet credit when they complete their first paid order. They
                get {referral.referee_benefit} on their first order.
              </p>

              <div className="referral-field">
                <label>Your referral code</label>

                <div className="referral-copy-row">
                  <code>{referral.referral_code}</code>

                  <button
                    type="button"
                    className="referral-copy-btn"
                    onClick={() =>
                      copyText(referral.referral_code, "Referral code")
                    }
                    aria-label="Copy referral code"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="referral-field">
                <label>Share link</label>

                <div className="referral-copy-row">
                  <span className="referral-link">{referralLink}</span>

                  <button
                    type="button"
                    className="referral-copy-btn"
                    onClick={() => copyText(referralLink, "Referral link")}
                    aria-label="Copy referral link"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {referral.welcome_coupon && (
                <div className="referral-welcome">
                  <strong>Your welcome offer</strong>

                  <p>
                    Use code <code>{referral.welcome_coupon.code}</code> at
                    checkout
                    {referral.welcome_coupon.is_used ? " (already used)" : ""}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AccountLayout>
  );
}
