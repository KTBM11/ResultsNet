namespace ResultsNet.Entities
{
    public class Password{
        public byte[] PasswordHash {get; set;}
        public byte[] PasswordSalt {get; set;}

        public Password(byte[] PasswordHash, byte[] PasswordSalt)
        {
            this.PasswordHash = PasswordHash;
            this.PasswordSalt = PasswordSalt;
        }

        public override string ToString()
        {
            string hashString = "";
            string saltString = "";
            for (int i = 0; i < PasswordHash.Length; i++)
            {
                hashString += PasswordHash[i];
            }
            for (int i = 0; i < PasswordSalt.Length; i++)
            {
                saltString += PasswordSalt[i];
            }
            return $"Password Hash: {hashString}, Password Salt: {saltString}";
        }
    }
}