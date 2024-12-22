import React from "react";
import RequestCard from "./RequestCard";

const RequestCardList = () => {
  return (
    <div className="grid grid-cols-1 gap-5 w-full px-10 md:grid-cols-3 md:gap-8">
      <RequestCard />
      <RequestCard />
      <RequestCard />
      <RequestCard />
      <RequestCard />
      <RequestCard />
    </div>
  );
};

export default RequestCardList;
