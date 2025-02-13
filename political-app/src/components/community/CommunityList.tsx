const communities = ["Democrat", "Republican", "Libertarian", "Independent", "Conservative", "Socialist"];

const CommunityList = () => {
  return (
    <div>
      <h2 className="text-lg font-bold">Communities</h2>
      <ul>
        {communities.map((community) => (
          <li key={community} className="border p-2 my-1 rounded bg-white">
            {community}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityList;
