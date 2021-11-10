interface ILootComponents {
  function chestComponents ( uint256 tokenId ) external view returns ( uint256[5]  memory );
  function footComponents ( uint256 tokenId ) external view returns ( uint256[5]  memory );
  function handComponents ( uint256 tokenId ) external view returns ( uint256[5]  memory );
  function headComponents ( uint256 tokenId ) external view returns ( uint256[5]  memory );
  function neckComponents ( uint256 tokenId ) external view returns ( uint256[5]  memory );
  function ringComponents ( uint256 tokenId ) external view returns ( uint256[5]  memory );
  function waistComponents ( uint256 tokenId ) external view returns ( uint256[5]  memory );
  function weaponComponents ( uint256 tokenId ) external view returns ( uint256[5]  memory );
}
