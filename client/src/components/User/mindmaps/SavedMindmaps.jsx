import React, { useEffect, useState } from "react";
import { Layout } from "../../Layout";
import { Button, Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import Loader from "../../Loader";
import axios from "../../../axios.js";
import { toast } from "react-hot-toast";
import { IoSaveOutline } from "react-icons/io5";
import { IoOpenOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import Background from "../../Background/Background.jsx";
import { ThreeDCard } from "../../3DCard/ThreeDCard.jsx";

const SavedMindmaps = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mindmaps, setMindmaps] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const res = await axios.get("/mindmap/get");
        setMindmaps(res.data);
        console.log(mindmaps);
        // toast.success("All the Mindmaps fetched!");
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        toast.error( "Server error please try again later");
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData()
  }, []);

  return (
    <>
    <Background />
      {isLoading ? <Loader width="500px" height="250px" /> : null}
      <Layout>
        <div className="flex justify-between m-5 text-2xl text-center">
          Saved Mindmaps
        </div>

        {!mindmaps && !isLoading && (
          <div className="flex justify-center gap-2 mt-[8vh] text-2xl text-yellow-200">
            <span>Opps!! No Mindmaps Saved</span>
            <div className="p-1">
              <IoSaveOutline />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 m-3 justify-center">
          {mindmaps?.data?.map((item, index) => {
            console.log(item);
            return (
              <>
                <ThreeDCard item={item} index={index} />
              </>
            );
          })}
        </div>
      </Layout>
    </>
  );
};

export default SavedMindmaps;
